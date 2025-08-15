/**
 * @pattern Memento
 * @description Game state memento system for save/load functionality
 */

import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { ItemInstance } from '@domain/valueObject/Item';

/**
 * @pattern Memento
 * @description Game state snapshot interface
 */
export interface IGameMemento {
  readonly id: string;
  readonly timestamp: number;
  readonly version: string;
  getState(): GameState;
  getMetadata(): MementoMetadata;
}

/**
 * @pattern Memento
 * @description Memento metadata for save information
 */
export interface MementoMetadata {
  id: string;
  timestamp: number;
  version: string;
  saveName: string;
  playerName: string;
  characterClass: string;
  playTime: number;
  level: number;
  location: string;
  description: string;
}

/**
 * @pattern Memento
 * @description Complete game state structure
 */
export interface GameState {
  player: PlayerState;
  map: MapState;
  inventory: InventoryState;
  gameSettings: GameSettings;
  statistics: GameStatistics;
  quests: QuestState;
  timestamp: number;
}

/**
 * @pattern Memento
 * @description Player state for serialization
 */
export interface PlayerState {
  id: string;
  name: string;
  characterClass: string;
  position: { x: number; y: number; z: number };
  direction: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
  equipment: EquipmentState;
  skills: SkillState[];
  playTime: number;
  lastSaveTime: number;
}

/**
 * @pattern Memento
 * @description Equipment state
 */
export interface EquipmentState {
  weapon?: string;
  shield?: string;
  helmet?: string;
  chest?: string;
  gloves?: string;
  boots?: string;
  accessory1?: string;
  accessory2?: string;
}

/**
 * @pattern Memento
 * @description Skill state
 */
export interface SkillState {
  id: string;
  name: string;
  level: number;
  experience: number;
  cooldown: number;
}

/**
 * @pattern Memento
 * @description Map state for serialization
 */
export interface MapState {
  id: string;
  name: string;
  width: number;
  height: number;
  theme: string;
  tiles: TileState[][];
  discoveredAreas: boolean[][];
  visitedPositions: PositionState[];
  currentLayer: number;
}

/**
 * @pattern Memento
 * @description Tile state
 */
export interface TileState {
  type: string;
  x: number;
  y: number;
  z: number;
  walkable: boolean;
  movementCost: number;
  elevation: number;
  properties: { [key: string]: any };
}

/**
 * @pattern Memento
 * @description Position state
 */
export interface PositionState {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * @pattern Memento
 * @description Inventory state for serialization
 */
export interface InventoryState {
  items: ItemInstanceState[];
  gold: number;
  maxCapacity: number;
  currentCapacity: number;
}

/**
 * @pattern Memento
 * @description Item instance state
 */
export interface ItemInstanceState {
  uniqueId: string;
  itemId: string;
  quantity: number;
  enhancements?: ItemEnhancementState;
  durability?: number;
  maxDurability?: number;
  acquiredAt: number;
}

/**
 * @pattern Memento
 * @description Item enhancement state
 */
export interface ItemEnhancementState {
  enchantment?: {
    type: string;
    level: number;
  };
  masterwork?: boolean;
  legendary?: string;
}

/**
 * @pattern Memento
 * @description Game settings state
 */
export interface GameSettings {
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
  };
  graphics: {
    resolution: string;
    fullscreen: boolean;
    vsync: boolean;
    quality: string;
  };
  controls: {
    keyBindings: { [key: string]: string };
    mouseSensitivity: number;
    invertY: boolean;
  };
  gameplay: {
    difficulty: string;
    autoSave: boolean;
    autoSaveInterval: number;
    showTooltips: boolean;
    showMinimap: boolean;
  };
}

/**
 * @pattern Memento
 * @description Game statistics state
 */
export interface GameStatistics {
  totalPlayTime: number;
  sessionsPlayed: number;
  itemsCollected: number;
  enemiesDefeated: number;
  questsCompleted: number;
  areasExplored: number;
  goldEarned: number;
  goldSpent: number;
  deaths: number;
  savesCount: number;
  lastSaveTime: number;
}

/**
 * @pattern Memento
 * @description Quest state
 */
export interface QuestState {
  activeQuests: ActiveQuestState[];
  completedQuests: string[];
  failedQuests: string[];
  questLog: QuestLogEntry[];
}

/**
 * @pattern Memento
 * @description Active quest state
 */
export interface ActiveQuestState {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjectiveState[];
  rewards: QuestRewardState;
  timeLimit?: number;
  startedAt: number;
  progress: number;
}

/**
 * @pattern Memento
 * @description Quest objective state
 */
export interface QuestObjectiveState {
  id: string;
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

/**
 * @pattern Memento
 * @description Quest reward state
 */
export interface QuestRewardState {
  experience: number;
  gold: number;
  items: string[];
  reputation?: { [key: string]: number };
}

/**
 * @pattern Memento
 * @description Quest log entry
 */
export interface QuestLogEntry {
  questId: string;
  action: 'started' | 'updated' | 'completed' | 'failed';
  timestamp: number;
  details: string;
}

/**
 * @pattern Concrete Memento
 * @description Game state memento implementation
 */
export class GameMemento implements IGameMemento {
  public readonly id: string;
  public readonly timestamp: number;
  public readonly version: string;
  private readonly state: GameState;
  private readonly metadata: MementoMetadata;

  constructor(
    id: string,
    state: GameState,
    metadata: MementoMetadata,
    version: string = '1.0.0'
  ) {
    this.id = id;
    this.timestamp = Date.now();
    this.version = version;
    this.state = { ...state, timestamp: this.timestamp };
    this.metadata = { ...metadata, timestamp: this.timestamp };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getMetadata(): MementoMetadata {
    return { ...this.metadata };
  }

  /**
   * @pattern Memento
   * @description Serialize memento to JSON
   */
  public toJSON(): string {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp,
      version: this.version,
      state: this.state,
      metadata: this.metadata
    });
  }

  /**
   * @pattern Memento
   * @description Create memento from JSON
   */
  public static fromJSON(json: string): GameMemento {
    const data = JSON.parse(json);
    return new GameMemento(
      data.id,
      data.state,
      data.metadata,
      data.version
    );
  }

  /**
   * @pattern Memento
   * @description Validate memento data
   */
  public isValid(): boolean {
    return (
      this.id &&
      this.timestamp > 0 &&
      this.version &&
      this.state &&
      this.metadata &&
      this.state.player &&
      this.state.map &&
      this.state.inventory
    );
  }

  /**
   * @pattern Memento
   * @description Get memento size in bytes
   */
  public getSize(): number {
    return new Blob([this.toJSON()]).size;
  }

  /**
   * @pattern Memento
   * @description Check if memento is compatible with current version
   */
  public isCompatible(currentVersion: string): boolean {
    return this.version === currentVersion;
  }
}

/**
 * @pattern Originator
 * @description Game state originator that creates and restores mementos
 */
export class GameOriginator {
  private currentState: GameState | null = null;
  private readonly version: string = '1.0.0';

  /**
   * @pattern Originator
   * @description Create memento from current game state
   */
  public createMemento(saveName: string, player: Player, map: Map): GameMemento {
    if (!this.currentState) {
      throw new Error('No current game state to save');
    }

    const metadata: MementoMetadata = {
      id: this.generateSaveId(),
      timestamp: Date.now(),
      version: this.version,
      saveName,
      playerName: player.name,
      characterClass: player.characterClass.type,
      playTime: this.currentState.statistics.totalPlayTime,
      level: player.level || 1,
      location: `${map.name} (${player.getX()}, ${player.getY()})`,
      description: `Level ${player.level || 1} ${player.characterClass.type} - ${saveName}`
    };

    return new GameMemento(
      metadata.id,
      this.currentState,
      metadata,
      this.version
    );
  }

  /**
   * @pattern Originator
   * @description Restore game state from memento
   */
  public restoreFromMemento(memento: GameMemento): GameState {
    if (!memento.isValid()) {
      throw new Error('Invalid memento data');
    }

    if (!memento.isCompatible(this.version)) {
      throw new Error(`Incompatible save version: ${memento.version}`);
    }

    this.currentState = memento.getState();
    return this.currentState;
  }

  /**
   * @pattern Originator
   * @description Set current game state
   */
  public setState(state: GameState): void {
    this.currentState = { ...state };
  }

  /**
   * @pattern Originator
   * @description Get current game state
   */
  public getState(): GameState | null {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * @pattern Originator
   * @description Generate unique save ID
   */
  private generateSaveId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * @pattern Originator
   * @description Export game state to JSON
   */
  public exportState(): string {
    if (!this.currentState) {
      throw new Error('No current state to export');
    }
    return JSON.stringify(this.currentState);
  }

  /**
   * @pattern Originator
   * @description Import game state from JSON
   */
  public importState(json: string): void {
    try {
      const state = JSON.parse(json) as GameState;
      this.setState(state);
    } catch (error) {
      throw new Error(`Failed to import game state: ${error}`);
    }
  }
}

/**
 * @pattern Caretaker
 * @description Memento caretaker for managing save history and storage
 */
export class GameCaretaker {
  public mementos: Map<string, GameMemento> = new Map();
  private originator: GameOriginator;
  private maxSaves: number = 10;
  private autoSaveInterval: number = 300000; // 5 minutes
  private lastAutoSave: number = 0;

  constructor(originator: GameOriginator) {
    this.originator = originator;
    // Ensure mementos is always a Map
    if (!(this.mementos instanceof Map)) {
      this.mementos = new Map();
    }
    console.log('GameCaretaker constructor - mementos type:', typeof this.mementos, this.mementos instanceof Map);
  }

  /**
   * @pattern Caretaker
   * @description Save game state
   */
  public saveGame(saveName: string, player: Player, map: Map): GameMemento {
    const memento = this.originator.createMemento(saveName, player, map);
    this.mementos.set(memento.id, memento);
    
    // Clean up old saves if exceeding limit
    this.cleanupOldSaves();
    
    return memento;
  }

  /**
   * @pattern Caretaker
   * @description Auto-save game state
   */
  public autoSave(player: Player, map: Map): GameMemento | null {
    const now = Date.now();
    if (now - this.lastAutoSave < this.autoSaveInterval) {
      return null;
    }

    this.lastAutoSave = now;
    return this.saveGame('Auto Save', player, map);
  }

  /**
   * @pattern Caretaker
   * @description Load game state
   */
  public loadGame(saveId: string): GameState {
    const memento = this.mementos.get(saveId);
    if (!memento) {
      throw new Error(`Save not found: ${saveId}`);
    }

    return this.originator.restoreFromMemento(memento);
  }

  /**
   * @pattern Caretaker
   * @description Get all available saves
   */
  public getSaves(): MementoMetadata[] {
    return Array.from(this.mementos.values()).map(m => m.getMetadata());
  }

  /**
   * @pattern Caretaker
   * @description Get save by ID
   */
  public getSave(saveId: string): GameMemento | null {
    return this.mementos.get(saveId) || null;
  }

  /**
   * @pattern Caretaker
   * @description Delete save
   */
  public deleteSave(saveId: string): boolean {
    return this.mementos.delete(saveId);
  }

  /**
   * @pattern Caretaker
   * @description Clear all saves
   */
  public clearSaves(): void {
    this.mementos.clear();
  }

  /**
   * @pattern Caretaker
   * @description Get save count
   */
  public getSaveCount(): number {
    return this.mementos.size;
  }

  /**
   * @pattern Caretaker
   * @description Check if save exists
   */
  public hasSave(saveId: string): boolean {
    return this.mementos.has(saveId);
  }

  /**
   * @pattern Caretaker
   * @description Get latest save
   */
  public getLatestSave(): GameMemento | null {
    if (this.mementos.size === 0) {
      return null;
    }

    const saves = Array.from(this.mementos.values());
    return saves.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  /**
   * @pattern Caretaker
   * @description Clean up old saves when exceeding limit
   */
  private cleanupOldSaves(): void {
    if (this.mementos.size <= this.maxSaves) {
      return;
    }

    const saves = Array.from(this.mementos.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove oldest saves
    const toRemove = saves.slice(0, saves.length - this.maxSaves);
    toRemove.forEach(([id]) => this.mementos.delete(id));
  }

  /**
   * @pattern Caretaker
   * @description Set maximum number of saves
   */
  public setMaxSaves(max: number): void {
    this.maxSaves = Math.max(1, max);
    this.cleanupOldSaves();
  }

  /**
   * @pattern Caretaker
   * @description Set auto-save interval
   */
  public setAutoSaveInterval(interval: number): void {
    this.autoSaveInterval = Math.max(60000, interval); // Minimum 1 minute
  }

  /**
   * @pattern Caretaker
   * @description Export all saves to JSON
   */
  public exportAllSaves(): string {
    const saves = Array.from(this.mementos.values()).map(m => m.toJSON());
    return JSON.stringify(saves);
  }

  /**
   * @pattern Caretaker
   * @description Import saves from JSON
   */
  public importSaves(json: string): void {
    try {
      const saves = JSON.parse(json) as string[];
      saves.forEach(saveJson => {
        try {
          const memento = GameMemento.fromJSON(saveJson);
          if (memento && memento.isValid()) {
            this.mementos.set(memento.id, memento);
          }
        } catch (mementoError) {
          console.warn('Failed to import individual save:', mementoError);
          // Continue with other saves
        }
      });
      this.cleanupOldSaves();
    } catch (error) {
      console.warn('Failed to import saves, resetting mementos:', error);
      // Reset mementos to prevent corruption
      this.mementos = new Map();
    }
  }
}


