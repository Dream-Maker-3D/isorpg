/**
 * @pattern Facade
 * @description Save/load service that integrates memento pattern with browser storage
 */

import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { 
  GameOriginator, 
  GameCaretaker, 
  GameMemento, 
  GameState, 
  MementoMetadata,
  PlayerState,
  MapState,
  InventoryState,
  GameSettings,
  GameStatistics,
  QuestState
} from '@patterns/behavioral/Memento/GameMemento';
import { EventBus } from '@gameKernel/Kernel';
import { InventoryComponent } from '@domain/entity/components/InventoryComponent';
import { ItemInstance } from '@domain/valueObject/Item';

/**
 * @pattern Observer
 * @description Save/load event data
 */
export interface SaveLoadEvent {
  eventType: 'save_started' | 'save_completed' | 'save_failed' | 'load_started' | 'load_completed' | 'load_failed' | 'auto_save';
  saveId?: string;
  saveName?: string;
  timestamp: number;
  message: string;
  error?: string;
}

/**
 * @pattern Facade
 * @description Save/load service providing simplified interface to memento system
 */
export class SaveLoadService {
  private originator: GameOriginator;
  private caretaker: GameCaretaker;
  private eventBus: EventBus;
  private storageKey: string = 'isorpg_saves';
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 300000; // 5 minutes
  private lastAutoSave: number = 0;
  private isEnabled: boolean = true;

  constructor() {
    this.originator = new GameOriginator();
    this.caretaker = new GameCaretaker(this.originator);
    this.eventBus = EventBus.getInstance();
    this.loadSavesFromStorage();
  }

  /**
   * @pattern Facade
   * @description Save game state
   */
  public async saveGame(saveName: string, player: Player, map: Map): Promise<GameMemento> {
    if (!this.isEnabled) {
      throw new Error('Save/load service is disabled');
    }

    try {
      this.emitSaveLoadEvent('save_started', { saveName });
      
      // Create game state from current entities
      const gameState = this.createGameState(player, map);
      this.originator.setState(gameState);
      
      // Create memento
      const memento = this.caretaker.saveGame(saveName, player, map);
      
      // Save to storage
      await this.saveToStorage();
      
      this.emitSaveLoadEvent('save_completed', { 
        saveId: memento.id, 
        saveName: memento.getMetadata().saveName 
      });
      
      return memento;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitSaveLoadEvent('save_failed', { 
        saveName, 
        error: errorMessage 
      });
      throw error;
    }
  }

  /**
   * @pattern Facade
   * @description Load game state
   */
  public async loadGame(saveId: string): Promise<GameState> {
    if (!this.isEnabled) {
      throw new Error('Save/load service is disabled');
    }

    try {
      this.emitSaveLoadEvent('load_started', { saveId });
      
      const gameState = this.caretaker.loadGame(saveId);
      
      this.emitSaveLoadEvent('load_completed', { 
        saveId,
        saveName: this.getSaveMetadata(saveId)?.saveName 
      });
      
      return gameState;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitSaveLoadEvent('load_failed', { 
        saveId, 
        error: errorMessage 
      });
      throw error;
    }
  }

  /**
   * @pattern Facade
   * @description Auto-save game state
   */
  public async autoSave(player: Player, map: Map): Promise<GameMemento | null> {
    if (!this.autoSaveEnabled || !this.isEnabled) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastAutoSave < this.autoSaveInterval) {
      return null;
    }

    try {
      const memento = await this.saveGame('Auto Save', player, map);
      this.lastAutoSave = now;
      this.emitSaveLoadEvent('auto_save', { 
        saveId: memento.id 
      });
      return memento;
    } catch (error) {
      console.warn('Auto-save failed:', error);
      return null;
    }
  }

  /**
   * @pattern Facade
   * @description Get all available saves
   */
  public getSaves(): MementoMetadata[] {
    return this.caretaker.getSaves();
  }

  /**
   * @pattern Facade
   * @description Get save metadata by ID
   */
  public getSaveMetadata(saveId: string): MementoMetadata | null {
    const memento = this.caretaker.getSave(saveId);
    return memento ? memento.getMetadata() : null;
  }

  /**
   * @pattern Facade
   * @description Delete save
   */
  public async deleteSave(saveId: string): Promise<boolean> {
    try {
      const success = this.caretaker.deleteSave(saveId);
      if (success) {
        await this.saveToStorage();
      }
      return success;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * @pattern Facade
   * @description Get latest save
   */
  public getLatestSave(): GameMemento | null {
    return this.caretaker.getLatestSave();
  }

  /**
   * @pattern Facade
   * @description Check if save exists
   */
  public hasSave(saveId: string): boolean {
    return this.caretaker.hasSave(saveId);
  }

  /**
   * @pattern Facade
   * @description Get save count
   */
  public getSaveCount(): number {
    return this.caretaker.getSaveCount();
  }

  /**
   * @pattern Facade
   * @description Export all saves
   */
  public exportSaves(): string {
    return this.caretaker.exportAllSaves();
  }

  /**
   * @pattern Facade
   * @description Import saves
   */
  public async importSaves(json: string): Promise<void> {
    try {
      this.caretaker.importSaves(json);
      await this.saveToStorage();
    } catch (error) {
      throw new Error(`Failed to import saves: ${error}`);
    }
  }

  /**
   * @pattern Facade
   * @description Clear all saves
   */
  public async clearSaves(): Promise<void> {
    this.caretaker.clearSaves();
    await this.saveToStorage();
  }

  /**
   * @pattern Facade
   * @description Enable/disable auto-save
   */
  public setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }

  /**
   * @pattern Facade
   * @description Set auto-save interval
   */
  public setAutoSaveInterval(interval: number): void {
    this.autoSaveInterval = Math.max(60000, interval); // Minimum 1 minute
    this.caretaker.setAutoSaveInterval(interval);
  }

  /**
   * @pattern Facade
   * @description Set maximum number of saves
   */
  public setMaxSaves(max: number): void {
    this.caretaker.setMaxSaves(max);
  }

  /**
   * @pattern Facade
   * @description Enable/disable save/load service
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * @pattern Facade
   * @description Check if service is enabled
   */
  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * @pattern Facade
   * @description Check if auto-save is enabled
   */
  public isAutoSaveEnabled(): boolean {
    return this.autoSaveEnabled;
  }

  /**
   * @pattern Facade
   * @description Get service statistics
   */
  public getServiceStats(): {
    saveCount: number;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    enabled: boolean;
    lastAutoSave: number;
    storageSize: number;
  } {
    return {
      saveCount: this.getSaveCount(),
      autoSaveEnabled: this.autoSaveEnabled,
      autoSaveInterval: this.autoSaveInterval,
      enabled: this.isEnabled,
      lastAutoSave: this.lastAutoSave,
      storageSize: this.getStorageSize()
    };
  }

  /**
   * @pattern Observer
   * @description Emit save/load event
   */
  private emitSaveLoadEvent(
    eventType: SaveLoadEvent['eventType'], 
    data: Partial<SaveLoadEvent>
  ): void {
    const event: SaveLoadEvent = {
      eventType,
      timestamp: Date.now(),
      message: this.getEventMessage(eventType, data),
      ...data
    };
    this.eventBus.emit('saveLoad:event', event);
  }

  /**
   * @pattern Observer
   * @description Get event message
   */
  private getEventMessage(eventType: string, data: Partial<SaveLoadEvent>): string {
    switch (eventType) {
      case 'save_started':
        return `Started saving game: ${data.saveName}`;
      case 'save_completed':
        return `Game saved successfully: ${data.saveName}`;
      case 'save_failed':
        return `Failed to save game: ${data.error}`;
      case 'load_started':
        return `Started loading game: ${data.saveId}`;
      case 'load_completed':
        return `Game loaded successfully: ${data.saveName}`;
      case 'load_failed':
        return `Failed to load game: ${data.error}`;
      case 'auto_save':
        return `Auto-save completed: ${data.saveId}`;
      default:
        return 'Save/load event occurred';
    }
  }

  /**
   * @pattern Facade
   * @description Create game state from entities
   */
  private createGameState(player: Player, map: Map): GameState {
    const playerState = this.createPlayerState(player);
    const mapState = this.createMapState(map);
    const inventoryState = this.createInventoryState(player);
    const gameSettings = this.getDefaultGameSettings();
    const gameStatistics = this.getDefaultGameStatistics();
    const questState = this.getDefaultQuestState();

    return {
      player: playerState,
      map: mapState,
      inventory: inventoryState,
      gameSettings,
      statistics: gameStatistics,
      quests: questState,
      timestamp: Date.now()
    };
  }

  /**
   * @pattern Facade
   * @description Create player state from player entity
   */
  private createPlayerState(player: Player): PlayerState {
    const position = player.getPosition();
    const direction = player.getCurrentDirection();
    const inventoryComponent = player.inventory;

    return {
      id: player.id,
      name: player.name,
      characterClass: player.characterClass.type,
      position: { x: position.x, y: position.y, z: position.z },
      direction: direction,
      level: player.level || 1,
      experience: player.experience || 0,
      health: player.health || 100,
      maxHealth: player.maxHealth || 100,
      mana: player.mana || 50,
      maxMana: player.maxMana || 50,
      stats: {
        strength: player.characterClass.stats.strength,
        agility: player.characterClass.stats.agility,
        intelligence: player.characterClass.stats.intelligence,
        vitality: player.characterClass.stats.vitality
      },
      equipment: {
        weapon: undefined,
        shield: undefined,
        helmet: undefined,
        chest: undefined,
        gloves: undefined,
        boots: undefined,
        accessory1: undefined,
        accessory2: undefined
      },
      skills: [],
      playTime: 0,
      lastSaveTime: Date.now()
    };
  }

  /**
   * @pattern Facade
   * @description Create map state from map entity
   */
  private createMapState(map: Map): MapState {
    return {
      id: map.id,
      name: map.name,
      width: map.width,
      height: map.height,
      theme: map.theme,
      tiles: [], // Would need to serialize tile data
      discoveredAreas: Array(map.height).fill(null).map(() => Array(map.width).fill(false)),
      visitedPositions: [],
      currentLayer: 0
    };
  }

  /**
   * @pattern Facade
   * @description Create inventory state from player
   */
  private createInventoryState(player: Player): InventoryState {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return {
        items: [],
        gold: 0,
        maxCapacity: 20,
        currentCapacity: 0
      };
    }

    const items: ItemInstanceState[] = Array.from(inventoryComponent.newItems.values()).map(item => ({
      uniqueId: item.uniqueId,
      itemId: item.item.id,
      quantity: item.quantity,
      acquiredAt: Date.now()
    }));

    return {
      items,
      gold: inventoryComponent.gold,
      maxCapacity: inventoryComponent.maxCapacity,
      currentCapacity: inventoryComponent.currentCapacity
    };
  }

  /**
   * @pattern Facade
   * @description Get default game settings
   */
  private getDefaultGameSettings(): GameSettings {
    return {
      audio: {
        masterVolume: 1.0,
        musicVolume: 0.8,
        sfxVolume: 0.9,
        voiceVolume: 1.0
      },
      graphics: {
        resolution: '1920x1080',
        fullscreen: false,
        vsync: true,
        quality: 'high'
      },
      controls: {
        keyBindings: {
          'move_up': 'w',
          'move_down': 's',
          'move_left': 'a',
          'move_right': 'd',
          'inventory': 'i',
          'menu': 'escape'
        },
        mouseSensitivity: 1.0,
        invertY: false
      },
      gameplay: {
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 300000,
        showTooltips: true,
        showMinimap: true
      }
    };
  }

  /**
   * @pattern Facade
   * @description Get default game statistics
   */
  private getDefaultGameStatistics(): GameStatistics {
    return {
      totalPlayTime: 0,
      sessionsPlayed: 1,
      itemsCollected: 0,
      enemiesDefeated: 0,
      questsCompleted: 0,
      areasExplored: 0,
      goldEarned: 0,
      goldSpent: 0,
      deaths: 0,
      savesCount: 0,
      lastSaveTime: Date.now()
    };
  }

  /**
   * @pattern Facade
   * @description Get default quest state
   */
  private getDefaultQuestState(): QuestState {
    return {
      activeQuests: [],
      completedQuests: [],
      failedQuests: [],
      questLog: []
    };
  }

  /**
   * @pattern Facade
   * @description Save mementos to localStorage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const savesJson = this.caretaker.exportAllSaves();
      localStorage.setItem(this.storageKey, savesJson);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save game data to storage');
    }
  }

  /**
   * @pattern Facade
   * @description Load mementos from localStorage
   */
  private loadSavesFromStorage(): void {
    try {
      const savesJson = localStorage.getItem(this.storageKey);
      if (savesJson) {
        this.caretaker.importSaves(savesJson);
      }
    } catch (error) {
      console.warn('Failed to load saves from localStorage:', error);
      // Continue without loading saves
    }
  }

  /**
   * @pattern Facade
   * @description Get storage size in bytes
   */
  private getStorageSize(): number {
    try {
      const savesJson = localStorage.getItem(this.storageKey);
      return savesJson ? new Blob([savesJson]).size : 0;
    } catch (error) {
      return 0;
    }
  }
}

