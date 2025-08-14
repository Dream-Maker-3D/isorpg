/**
 * @pattern Facade
 * @description High-level save/load manager for the game
 */

import { SaveLoadService } from '@domain/service/SaveLoadService';
import { SaveLoadSystem } from '@domain/system/SaveLoadSystem';
import { EventBus } from '@gameKernel/Kernel';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';

/**
 * @pattern Observer
 * @description Save/load manager events
 */
export interface SaveLoadManagerEvent {
  eventType: 'save_ready' | 'load_ready' | 'save_progress' | 'load_progress';
  timestamp: number;
  data?: any;
}

/**
 * @pattern Facade
 * @description Save/load manager providing high-level interface
 */
export class SaveLoadManager {
  private saveLoadService: SaveLoadService;
  private saveLoadSystem: SaveLoadSystem;
  private eventBus: EventBus;
  private isInitialized: boolean = false;
  private autoSaveEnabled: boolean = true;
  private saveCallbacks: Map<string, (event: any) => void> = new Map();

  constructor() {
    this.saveLoadService = new SaveLoadService();
    this.saveLoadSystem = new SaveLoadSystem();
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  /**
   * @pattern Observer
   * @description Setup event listeners for save/load operations
   */
  private setupEventListeners(): void {
    // Listen to save/load system events
    this.eventBus.on('saveLoad:system_event', this.handleSystemEvent.bind(this));
    this.eventBus.on('saveLoad:auto_save_completed', this.handleAutoSaveCompleted.bind(this));
    this.eventBus.on('saveLoad:manual_save_completed', this.handleManualSaveCompleted.bind(this));
    this.eventBus.on('saveLoad:game_state_loaded', this.handleGameStateLoaded.bind(this));
    
    // Listen to service events
    this.eventBus.on('saveLoad:event', this.handleServiceEvent.bind(this));
  }

  /**
   * @pattern Observer
   * @description Handle system events
   */
  private handleSystemEvent(event: any): void {
    console.log('SaveLoadManager: System event:', event);
    this.emitManagerEvent('save_progress', { systemEvent: event });
  }

  /**
   * @pattern Observer
   * @description Handle auto-save completion
   */
  private handleAutoSaveCompleted(event: any): void {
    console.log('SaveLoadManager: Auto-save completed:', event);
    this.emitManagerEvent('save_ready', { 
      type: 'auto_save',
      saveId: event.saveId 
    });
  }

  /**
   * @pattern Observer
   * @description Handle manual save completion
   */
  private handleManualSaveCompleted(event: any): void {
    console.log('SaveLoadManager: Manual save completed:', event);
    this.emitManagerEvent('save_ready', { 
      type: 'manual_save',
      saveId: event.saveId,
      saveName: event.saveName 
    });
  }

  /**
   * @pattern Observer
   * @description Handle game state loaded
   */
  private handleGameStateLoaded(event: any): void {
    console.log('SaveLoadManager: Game state loaded:', event);
    this.emitManagerEvent('load_ready', { 
      saveId: event.saveId,
      gameState: event.gameState 
    });
  }

  /**
   * @pattern Observer
   * @description Handle service events
   */
  private handleServiceEvent(event: any): void {
    console.log('SaveLoadManager: Service event:', event);
    this.emitManagerEvent('save_progress', { serviceEvent: event });
  }

  /**
   * @pattern Observer
   * @description Emit manager event
   */
  private emitManagerEvent(eventType: SaveLoadManagerEvent['eventType'], data?: any): void {
    const event: SaveLoadManagerEvent = {
      eventType,
      timestamp: Date.now(),
      data
    };
    this.eventBus.emit('saveLoad:manager_event', event);
  }

  /**
   * @pattern Facade
   * @description Initialize the save/load manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load existing saves from storage
      const saves = this.saveLoadService.getSaves();
      console.log(`SaveLoadManager: Loaded ${saves.length} existing saves`);
      
      this.isInitialized = true;
      console.log('SaveLoadManager: Initialized successfully');
    } catch (error) {
      console.error('SaveLoadManager: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * @pattern Facade
   * @description Register player and map for save/load operations
   */
  public registerGameEntities(player: Player, map: Map): void {
    if (!this.isInitialized) {
      throw new Error('SaveLoadManager not initialized');
    }

    // Emit events for the system to register
    this.eventBus.emit('player:created', { player });
    this.eventBus.emit('map:created', { map });
    
    console.log('SaveLoadManager: Game entities registered');
  }

  /**
   * @pattern Facade
   * @description Save game with custom name
   */
  public async saveGame(saveName: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('SaveLoadManager not initialized');
    }

    try {
      const success = await this.saveLoadSystem.saveGame(saveName);
      if (success) {
        console.log(`SaveLoadManager: Game saved as "${saveName}"`);
      }
      return success;
    } catch (error) {
      console.error('SaveLoadManager: Save failed:', error);
      return false;
    }
  }

  /**
   * @pattern Facade
   * @description Load game from save
   */
  public async loadGame(saveId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('SaveLoadManager not initialized');
    }

    try {
      const success = await this.saveLoadSystem.loadGame(saveId);
      if (success) {
        console.log(`SaveLoadManager: Game loaded from save: ${saveId}`);
      }
      return success;
    } catch (error) {
      console.error('SaveLoadManager: Load failed:', error);
      return false;
    }
  }

  /**
   * @pattern Facade
   * @description Quick save (uses default name with timestamp)
   */
  public async quickSave(): Promise<boolean> {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const saveName = `Quick Save ${timestamp}`;
    return await this.saveGame(saveName);
  }

  /**
   * @pattern Facade
   * @description Load latest save
   */
  public async loadLatestSave(): Promise<boolean> {
    const latestSave = this.saveLoadService.getLatestSave();
    if (!latestSave) {
      console.warn('SaveLoadManager: No saves available');
      return false;
    }

    return await this.loadGame(latestSave.id);
  }

  /**
   * @pattern Facade
   * @description Get all available saves
   */
  public getAvailableSaves(): any[] {
    return this.saveLoadService.getSaves();
  }

  /**
   * @pattern Facade
   * @description Check if save exists
   */
  public hasSave(saveId: string): boolean {
    return this.saveLoadService.hasSave(saveId);
  }

  /**
   * @pattern Facade
   * @description Get save metadata
   */
  public getSaveMetadata(saveId: string): any {
    return this.saveLoadService.getSaveMetadata(saveId);
  }

  /**
   * @pattern Facade
   * @description Delete save
   */
  public async deleteSave(saveId: string): Promise<boolean> {
    return await this.saveLoadService.deleteSave(saveId);
  }

  /**
   * @pattern Facade
   * @description Export all saves
   */
  public exportSaves(): string {
    return this.saveLoadService.exportSaves();
  }

  /**
   * @pattern Facade
   * @description Import saves
   */
  public async importSaves(json: string): Promise<void> {
    await this.saveLoadService.importSaves(json);
  }

  /**
   * @pattern Facade
   * @description Clear all saves
   */
  public async clearSaves(): Promise<void> {
    await this.saveLoadService.clearSaves();
  }

  /**
   * @pattern Facade
   * @description Enable/disable auto-save
   */
  public setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    this.saveLoadService.setAutoSaveEnabled(enabled);
    this.saveLoadSystem.setEnabled(enabled);
  }

  /**
   * @pattern Facade
   * @description Set auto-save interval
   */
  public setAutoSaveInterval(interval: number): void {
    this.saveLoadService.setAutoSaveInterval(interval);
    this.saveLoadSystem.setAutoSaveInterval(interval);
  }

  /**
   * @pattern Facade
   * @description Set maximum number of saves
   */
  public setMaxSaves(max: number): void {
    this.saveLoadService.setMaxSaves(max);
  }

  /**
   * @pattern Facade
   * @description Get manager statistics
   */
  public getManagerStats(): {
    initialized: boolean;
    autoSaveEnabled: boolean;
    saveCount: number;
    systemEnabled: boolean;
    serviceEnabled: boolean;
  } {
    return {
      initialized: this.isInitialized,
      autoSaveEnabled: this.autoSaveEnabled,
      saveCount: this.saveLoadService.getSaveCount(),
      systemEnabled: this.saveLoadSystem.isSystemEnabled(),
      serviceEnabled: this.saveLoadService.isServiceEnabled()
    };
  }

  /**
   * @pattern Facade
   * @description Get system statistics
   */
  public getSystemStats(): any {
    return this.saveLoadSystem.getSystemStats();
  }

  /**
   * @pattern Facade
   * @description Get service statistics
   */
  public getServiceStats(): any {
    return this.saveLoadService.getServiceStats();
  }

  /**
   * @pattern Observer
   * @description Register callback for save/load events
   */
  public onSaveLoadEvent(eventType: string, callback: (event: any) => void): void {
    this.saveCallbacks.set(eventType, callback);
  }

  /**
   * @pattern Observer
   * @description Remove callback for save/load events
   */
  public removeSaveLoadCallback(eventType: string): void {
    this.saveCallbacks.delete(eventType);
  }

  /**
   * @pattern Facade
   * @description Pause auto-save (useful during loading screens)
   */
  public pauseAutoSave(): void {
    this.saveLoadSystem.setEnabled(false);
  }

  /**
   * @pattern Facade
   * @description Resume auto-save
   */
  public resumeAutoSave(): void {
    this.saveLoadSystem.setEnabled(true);
  }

  /**
   * @pattern Facade
   * @description Force auto-save now
   */
  public async forceAutoSave(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Reset the timer and trigger auto-save
      this.saveLoadSystem.setAutoSaveInterval(0);
      await this.saveLoadSystem.saveGame('Force Auto Save');
      return true;
    } catch (error) {
      console.error('SaveLoadManager: Force auto-save failed:', error);
      return false;
    }
  }
}


