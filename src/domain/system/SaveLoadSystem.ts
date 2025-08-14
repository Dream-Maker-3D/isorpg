/**
 * @pattern System
 * @description Save/load system that integrates with ECS architecture
 */

import { System, EventBus } from '@gameKernel/Kernel';
import { SaveLoadService } from '@domain/service/SaveLoadService';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';

/**
 * @pattern Observer
 * @description Save/load system events
 */
export interface SaveLoadSystemEvent {
  eventType: 'auto_save_triggered' | 'save_requested' | 'load_requested';
  timestamp: number;
  data?: any;
}

/**
 * @pattern System
 * @description ECS system for managing save/load operations
 */
export class SaveLoadSystem extends System {
  private saveLoadService: SaveLoadService;
  private player: Player | null = null;
  private map: Map | null = null;
  private autoSaveTimer: number = 0;
  private autoSaveInterval: number = 300000; // 5 minutes
  private isEnabled: boolean = true;

  constructor() {
    super();
    this.saveLoadService = new SaveLoadService();
    this.setupEventListeners();
  }

  /**
   * @pattern Observer
   * @description Setup event listeners for save/load operations
   */
  private setupEventListeners(): void {
    this.eventBus.on('saveLoad:event', this.handleSaveLoadEvent.bind(this));
    this.eventBus.on('player:created', this.handlePlayerCreated.bind(this));
    this.eventBus.on('map:created', this.handleMapCreated.bind(this));
    this.eventBus.on('game:pause', this.handleGamePause.bind(this));
    this.eventBus.on('game:resume', this.handleGameResume.bind(this));
  }

  /**
   * @pattern Observer
   * @description Handle save/load events from the service
   */
  private handleSaveLoadEvent(event: any): void {
    console.log('SaveLoadSystem: Event received:', event);
    
    // Emit system-specific events
    this.eventBus.emit('saveLoad:system_event', {
      eventType: event.eventType,
      timestamp: Date.now(),
      data: event
    });
  }

  /**
   * @pattern Observer
   * @description Handle player creation event
   */
  private handlePlayerCreated(event: any): void {
    if (event.player && event.player instanceof Player) {
      this.player = event.player;
      console.log('SaveLoadSystem: Player registered for save/load');
    }
  }

  /**
   * @pattern Observer
   * @description Handle map creation event
   */
  private handleMapCreated(event: any): void {
    if (event.map && event.map instanceof Map) {
      this.map = event.map;
      console.log('SaveLoadSystem: Map registered for save/load');
    }
  }

  /**
   * @pattern Observer
   * @description Handle game pause event
   */
  private handleGamePause(event: any): void {
    if (this.player && this.map) {
      this.autoSave();
    }
  }

  /**
   * @pattern Observer
   * @description Handle game resume event
   */
  private handleGameResume(event: any): void {
    // Reset auto-save timer when game resumes
    this.autoSaveTimer = 0;
  }

  /**
   * @pattern System
   * @description Update system logic
   */
  public update(deltaTime: number): void {
    if (!this.isEnabled || !this.player || !this.map) {
      return;
    }

    // Update auto-save timer
    this.autoSaveTimer += deltaTime;
    
    // Check if auto-save should trigger
    if (this.autoSaveTimer >= this.autoSaveInterval) {
      this.autoSave();
      this.autoSaveTimer = 0;
    }
  }

  /**
   * @pattern System
   * @description Trigger auto-save
   */
  private async autoSave(): Promise<void> {
    if (!this.player || !this.map) {
      return;
    }

    try {
      const memento = await this.saveLoadService.autoSave(this.player, this.map);
      if (memento) {
        console.log('SaveLoadSystem: Auto-save completed');
        this.eventBus.emit('saveLoad:auto_save_completed', {
          saveId: memento.id,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn('SaveLoadSystem: Auto-save failed:', error);
      this.eventBus.emit('saveLoad:auto_save_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * @pattern System
   * @description Manual save request
   */
  public async saveGame(saveName: string): Promise<boolean> {
    if (!this.player || !this.map) {
      console.warn('SaveLoadSystem: Cannot save - player or map not available');
      return false;
    }

    try {
      const memento = await this.saveLoadService.saveGame(saveName, this.player, this.map);
      console.log('SaveLoadSystem: Manual save completed:', memento.id);
      
      this.eventBus.emit('saveLoad:manual_save_completed', {
        saveId: memento.id,
        saveName: memento.getMetadata().saveName,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('SaveLoadSystem: Manual save failed:', error);
      
      this.eventBus.emit('saveLoad:manual_save_failed', {
        saveName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      return false;
    }
  }

  /**
   * @pattern System
   * @description Load game request
   */
  public async loadGame(saveId: string): Promise<boolean> {
    try {
      const gameState = await this.saveLoadService.loadGame(saveId);
      console.log('SaveLoadSystem: Load completed for save:', saveId);
      
      // Emit event for other systems to restore state
      this.eventBus.emit('saveLoad:game_state_loaded', {
        saveId,
        gameState,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('SaveLoadSystem: Load failed:', error);
      
      this.eventBus.emit('saveLoad:load_failed', {
        saveId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      return false;
    }
  }

  /**
   * @pattern System
   * @description Get available saves
   */
  public getAvailableSaves(): any[] {
    return this.saveLoadService.getSaves();
  }

  /**
   * @pattern System
   * @description Check if save exists
   */
  public hasSave(saveId: string): boolean {
    return this.saveLoadService.hasSave(saveId);
  }

  /**
   * @pattern System
   * @description Get save metadata
   */
  public getSaveMetadata(saveId: string): any {
    return this.saveLoadService.getSaveMetadata(saveId);
  }

  /**
   * @pattern System
   * @description Delete save
   */
  public async deleteSave(saveId: string): Promise<boolean> {
    return await this.saveLoadService.deleteSave(saveId);
  }

  /**
   * @pattern System
   * @description Enable/disable the system
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.autoSaveTimer = 0;
    }
  }

  /**
   * @pattern System
   * @description Check if system is enabled
   */
  public isSystemEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * @pattern System
   * @description Set auto-save interval
   */
  public setAutoSaveInterval(interval: number): void {
    this.autoSaveInterval = Math.max(60000, interval); // Minimum 1 minute
    this.saveLoadService.setAutoSaveInterval(interval);
  }

  /**
   * @pattern System
   * @description Get system statistics
   */
  public getSystemStats(): {
    enabled: boolean;
    autoSaveInterval: number;
    autoSaveTimer: number;
    saveCount: number;
    playerRegistered: boolean;
    mapRegistered: boolean;
  } {
    return {
      enabled: this.isEnabled,
      autoSaveInterval: this.autoSaveInterval,
      autoSaveTimer: this.autoSaveTimer,
      saveCount: this.saveLoadService.getSaveCount(),
      playerRegistered: this.player !== null,
      mapRegistered: this.map !== null
    };
  }
}

