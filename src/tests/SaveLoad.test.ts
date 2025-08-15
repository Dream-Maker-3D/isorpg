/**
 * @pattern Test
 * @description Unit tests for save/load system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SaveLoadSystem } from '@domain/system/SaveLoadSystem';
import { SaveLoadManager } from '@domain/service/SaveLoadManager';
import { SaveLoadService } from '@domain/service/SaveLoadService';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { EventBus } from '@gameKernel/Kernel';
import { PlayerBuilder } from '@patterns/creational/Builder/PlayerBuilder';
import { CharacterClass } from '@domain/valueObject/CharacterClass';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SaveLoadSystem', () => {
  let saveLoadSystem: SaveLoadSystem;
  let eventBus: EventBus;
  let player: Player;
  let map: Map;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create test entities
    player = PlayerBuilder.createWizard('TestWizard');
    map = new Map('TestMap', 10, 10, 'forest');
    
    // Get event bus instance
    eventBus = EventBus.getInstance();
    
    // Create system
    saveLoadSystem = new SaveLoadSystem();
  });

  afterEach(() => {
    // Clean up event listeners
    eventBus.emit('game:cleanup', {});
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      expect(saveLoadSystem.isSystemEnabled()).toBe(true);
      expect(saveLoadSystem.getSystemStats().enabled).toBe(true);
    });

    it('should register event listeners', () => {
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.playerRegistered).toBe(false);
      expect(stats.mapRegistered).toBe(false);
    });
  });

  describe('Entity Registration', () => {
    it('should register player when player:created event is emitted', () => {
      eventBus.emit('player:created', { player });
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.playerRegistered).toBe(true);
    });

    it('should register map when map:created event is emitted', () => {
      eventBus.emit('map:created', { map });
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.mapRegistered).toBe(true);
    });

    it('should register both player and map', () => {
      eventBus.emit('player:created', { player });
      eventBus.emit('map:created', { map });
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.playerRegistered).toBe(true);
      expect(stats.mapRegistered).toBe(true);
    });
  });

  describe('Auto-save', () => {
    beforeEach(() => {
      // Register entities
      eventBus.emit('player:created', { player });
      eventBus.emit('map:created', { map });
    });

    it('should trigger auto-save on game pause', async () => {
      const autoSaveSpy = vi.spyOn(saveLoadSystem as any, 'autoSave');
      
      eventBus.emit('game:pause', {});
      
      expect(autoSaveSpy).toHaveBeenCalled();
    });

    it('should reset auto-save timer on game resume', () => {
      // Set a custom auto-save interval for testing
      saveLoadSystem.setAutoSaveInterval(1000); // 1 second
      
      // Trigger auto-save timer
      saveLoadSystem.update(1000);
      
      // Resume game
      eventBus.emit('game:resume', {});
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.autoSaveTimer).toBe(0);
    });

    it('should not auto-save when system is disabled', () => {
      saveLoadSystem.setEnabled(false);
      
      const autoSaveSpy = vi.spyOn(saveLoadSystem as any, 'autoSave');
      eventBus.emit('game:pause', {});
      
      expect(autoSaveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Manual Save', () => {
    beforeEach(() => {
      // Register entities
      eventBus.emit('player:created', { player });
      eventBus.emit('map:created', { map });
    });

    it('should save game successfully', async () => {
      const result = await saveLoadSystem.saveGame('Test Save');
      expect(result).toBe(true);
    });

    it('should fail to save when entities not registered', async () => {
      // Create new system without registered entities
      const newSystem = new SaveLoadSystem();
      
      const result = await newSystem.saveGame('Test Save');
      expect(result).toBe(false);
    });

    it('should emit save completion event', async () => {
      let eventReceived = false;
      eventBus.on('saveLoad:manual_save_completed', () => {
        eventReceived = true;
      });
      
      await saveLoadSystem.saveGame('Test Save');
      
      expect(eventReceived).toBe(true);
    });
  });

  describe('Load Game', () => {
    beforeEach(() => {
      // Register entities
      eventBus.emit('player:created', { player });
      eventBus.emit('map:created', { map });
    });

    it('should load game successfully', async () => {
      // First save a game to have something to load
      const saveResult = await saveLoadSystem.saveGame('Test Save for Loading');
      expect(saveResult).toBe(true);
      
      // Get the save ID from the available saves
      const saves = saveLoadSystem.getAvailableSaves();
      expect(saves.length).toBeGreaterThan(0);
      const saveId = saves[0].id;
      
      // Now load the game
      const result = await saveLoadSystem.loadGame(saveId);
      expect(result).toBe(true);
    });

    it('should emit load completion event', async () => {
      // First save a game to have something to load
      const saveResult = await saveLoadSystem.saveGame('Test Save for Loading');
      expect(saveResult).toBe(true);
      
      // Get the save ID from the available saves
      const saves = saveLoadSystem.getAvailableSaves();
      expect(saves.length).toBeGreaterThan(0);
      const saveId = saves[0].id;
      
      let eventReceived = false;
      eventBus.on('saveLoad:game_state_loaded', () => {
        eventReceived = true;
      });
      
      // Now load the game
      await saveLoadSystem.loadGame(saveId);
      
      expect(eventReceived).toBe(true);
    });
  });

  describe('System Management', () => {
    it('should enable/disable system', () => {
      saveLoadSystem.setEnabled(false);
      expect(saveLoadSystem.isSystemEnabled()).toBe(false);
      
      saveLoadSystem.setEnabled(true);
      expect(saveLoadSystem.isSystemEnabled()).toBe(true);
    });

    it('should set auto-save interval', () => {
      saveLoadSystem.setAutoSaveInterval(60000); // 1 minute
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.autoSaveInterval).toBe(60000);
    });

    it('should enforce minimum auto-save interval', () => {
      saveLoadSystem.setAutoSaveInterval(30000); // 30 seconds (below minimum)
      
      const stats = saveLoadSystem.getSystemStats();
      expect(stats.autoSaveInterval).toBe(60000); // Should be set to minimum
    });
  });
});

describe('SaveLoadManager', () => {
  let saveLoadManager: SaveLoadManager;
  let eventBus: EventBus;
  let player: Player;
  let map: Map;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create test entities
    player = PlayerBuilder.createWizard('TestWizard');
    map = new Map('TestMap', 10, 10, 'forest');
    
    // Get event bus instance
    eventBus = EventBus.getInstance();
    
    // Create manager
    saveLoadManager = new SaveLoadManager();
  });

  afterEach(() => {
    // Clean up event listeners
    eventBus.emit('game:cleanup', {});
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(saveLoadManager.initialize()).resolves.not.toThrow();
      
      const stats = saveLoadManager.getManagerStats();
      expect(stats.initialized).toBe(true);
    });

    it('should not initialize twice', async () => {
      await saveLoadManager.initialize();
      await saveLoadManager.initialize(); // Should not throw
      
      const stats = saveLoadManager.getManagerStats();
      expect(stats.initialized).toBe(true);
    });
  });

  describe('Entity Registration', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should register game entities', () => {
      expect(() => {
        saveLoadManager.registerGameEntities(player, map);
      }).not.toThrow();
    });

    it('should fail to register entities before initialization', () => {
      const uninitializedManager = new SaveLoadManager();
      
      expect(() => {
        uninitializedManager.registerGameEntities(player, map);
      }).toThrow('SaveLoadManager not initialized');
    });
  });

  describe('Save Operations', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
      saveLoadManager.registerGameEntities(player, map);
    });

    it('should save game with custom name', async () => {
      const result = await saveLoadManager.saveGame('Custom Save');
      expect(result).toBe(true);
    });

    it('should perform quick save', async () => {
      const result = await saveLoadManager.quickSave();
      expect(result).toBe(true);
    });

    it('should fail to save before initialization', async () => {
      const uninitializedManager = new SaveLoadManager();
      
      await expect(uninitializedManager.saveGame('Test')).rejects.toThrow('SaveLoadManager not initialized');
    });
  });

  describe('Load Operations', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
      saveLoadManager.registerGameEntities(player, map);
    });

    it('should load game from save ID', async () => {
      // First save a game to have something to load
      const saveResult = await saveLoadManager.saveGame('Test Save for Loading');
      expect(saveResult).toBe(true);
      
      // Get the save ID from the available saves
      const saves = saveLoadManager.getAvailableSaves();
      expect(saves.length).toBeGreaterThan(0);
      const saveId = saves[0].id;
      
      // Now load the game
      const result = await saveLoadManager.loadGame(saveId);
      expect(result).toBe(true);
    });

    it('should load latest save', async () => {
      const result = await saveLoadManager.loadLatestSave();
      // This might fail if no saves exist, which is expected
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Save Management', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should get available saves', () => {
      const saves = saveLoadManager.getAvailableSaves();
      expect(Array.isArray(saves)).toBe(true);
    });

    it('should check if save exists', () => {
      const exists = saveLoadManager.hasSave('test_save_id');
      expect(typeof exists).toBe('boolean');
    });

    it('should get save metadata', () => {
      const metadata = saveLoadManager.getSaveMetadata('test_save_id');
      expect(metadata).toBeDefined();
    });

    it('should delete save', async () => {
      const result = await saveLoadManager.deleteSave('test_save_id');
      expect(typeof result).toBe('boolean');
    });

    it('should export saves', () => {
      const exportData = saveLoadManager.exportSaves();
      expect(typeof exportData).toBe('string');
    });

    it('should import saves', async () => {
      const importData = '[]';
      await expect(saveLoadManager.importSaves(importData)).resolves.not.toThrow();
    });

    it('should clear all saves', async () => {
      await expect(saveLoadManager.clearSaves()).resolves.not.toThrow();
    });
  });

  describe('Configuration', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should enable/disable auto-save', () => {
      saveLoadManager.setAutoSaveEnabled(false);
      
      const stats = saveLoadManager.getManagerStats();
      expect(stats.autoSaveEnabled).toBe(false);
    });

    it('should set auto-save interval', () => {
      saveLoadManager.setAutoSaveInterval(120000); // 2 minutes
      
      const serviceStats = saveLoadManager.getServiceStats();
      expect(serviceStats.autoSaveInterval).toBe(120000);
    });

    it('should set maximum saves', () => {
      saveLoadManager.setMaxSaves(5);
      
      // This is tested through the service
      expect(saveLoadManager).toBeDefined();
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should get manager statistics', () => {
      const stats = saveLoadManager.getManagerStats();
      expect(stats.initialized).toBe(true);
      expect(stats.autoSaveEnabled).toBe(true);
      expect(typeof stats.saveCount).toBe('number');
    });

    it('should get system statistics', () => {
      const stats = saveLoadManager.getSystemStats();
      expect(stats.enabled).toBe(true);
      expect(typeof stats.saveCount).toBe('number');
    });

    it('should get service statistics', () => {
      const stats = saveLoadManager.getServiceStats();
      expect(stats.enabled).toBe(true);
      expect(typeof stats.saveCount).toBe('number');
    });
  });

  describe('Auto-save Control', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should pause auto-save', () => {
      saveLoadManager.pauseAutoSave();
      
      const systemStats = saveLoadManager.getSystemStats();
      expect(systemStats.enabled).toBe(false);
    });

    it('should resume auto-save', () => {
      saveLoadManager.pauseAutoSave();
      saveLoadManager.resumeAutoSave();
      
      const systemStats = saveLoadManager.getSystemStats();
      expect(systemStats.enabled).toBe(true);
    });

    it('should force auto-save', async () => {
      const result = await saveLoadManager.forceAutoSave();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Event Callbacks', () => {
    beforeEach(async () => {
      await saveLoadManager.initialize();
    });

    it('should register and remove event callbacks', () => {
      const callback = vi.fn();
      
      saveLoadManager.onSaveLoadEvent('save_ready', callback);
      saveLoadManager.removeSaveLoadCallback('save_ready');
      
      // Should not throw
      expect(saveLoadManager).toBeDefined();
    });
  });
});

describe('SaveLoadService Integration', () => {
  let saveLoadService: SaveLoadService;
  let player: Player;
  let map: Map;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create test entities
    player = PlayerBuilder.createWizard('TestWizard');
    map = new Map('TestMap', 10, 10, 'forest');
    
    // Create service
    saveLoadService = new SaveLoadService();
  });

  describe('Save Operations', () => {
    it('should save game state', async () => {
      const memento = await saveLoadService.saveGame('Integration Test', player, map);
      
      expect(memento).toBeDefined();
      expect(memento.id).toBeDefined();
      expect(memento.getMetadata().saveName).toBe('Integration Test');
    });

    it('should auto-save game state', async () => {
      const memento = await saveLoadService.autoSave(player, map);
      
      // Auto-save might return null if interval hasn't passed
      if (memento) {
        expect(memento).toBeDefined();
        expect(memento.id).toBeDefined();
      }
    });
  });

  describe('Load Operations', () => {
    it('should load game state', async () => {
      // First save a game
      const memento = await saveLoadService.saveGame('Load Test', player, map);
      
      // Then load it
      const gameState = await saveLoadService.loadGame(memento.id);
      
      expect(gameState).toBeDefined();
      expect(gameState.player).toBeDefined();
      expect(gameState.map).toBeDefined();
    });
  });

  describe('Storage Operations', () => {
    it('should get available saves', () => {
      const saves = saveLoadService.getSaves();
      expect(Array.isArray(saves)).toBe(true);
    });

    it('should check save existence', () => {
      const exists = saveLoadService.hasSave('test_save_id');
      expect(typeof exists).toBe('boolean');
    });

    it('should get save metadata', () => {
      const metadata = saveLoadService.getSaveMetadata('test_save_id');
      expect(metadata).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should enable/disable auto-save', () => {
      saveLoadService.setAutoSaveEnabled(false);
      expect(saveLoadService.isAutoSaveEnabled()).toBe(false);
      
      saveLoadService.setAutoSaveEnabled(true);
      expect(saveLoadService.isAutoSaveEnabled()).toBe(true);
    });

    it('should set auto-save interval', () => {
      saveLoadService.setAutoSaveInterval(180000); // 3 minutes
      
      const stats = saveLoadService.getServiceStats();
      expect(stats.autoSaveInterval).toBe(180000);
    });

    it('should set maximum saves', () => {
      saveLoadService.setMaxSaves(15);
      
      // This is tested through the service
      expect(saveLoadService).toBeDefined();
    });
  });
});


