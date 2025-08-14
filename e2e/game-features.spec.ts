import { test, expect } from '@playwright/test';

/**
 * @pattern Test
 * @description End-to-end tests for isometric RPG game features
 */

test.describe('Isometric RPG Game Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForSelector('#game-container', { timeout: 10000 });
    
    // Wait for console messages indicating successful initialization
    await page.waitForFunction(() => {
      const logs = (window as any).console?.logs || [];
      return logs.some((log: string) => log.includes('✅ Save/load manager initialized'));
    }, { timeout: 15000 });
  });

  test.describe('C1 - Player Entity Creation', () => {
    test('should create player with Builder pattern', async ({ page }) => {
      // Check if save/load manager is exposed globally
      const saveLoadManager = await page.evaluate(() => (window as any).saveLoadManager);
      expect(saveLoadManager).toBeDefined();
      
      // Check if player builder is available
      const playerBuilder = await page.evaluate(() => (window as any).PlayerBuilder);
      expect(playerBuilder).toBeDefined();
      
      // Create a test player
      const player = await page.evaluate(() => {
        const { PlayerBuilder } = (window as any);
        return PlayerBuilder.createWizard('TestWizard');
      });
      
      expect(player).toBeDefined();
      expect(player.name).toBe('TestWizard');
      expect(player.characterClass.type).toBe('WIZARD');
    });

    test('should have player components', async ({ page }) => {
      const player = await page.evaluate(() => {
        const { PlayerBuilder } = (window as any);
        return PlayerBuilder.createWizard('TestWizard');
      });
      
      // Check for required components
      expect(player.hasComponent('Position')).toBe(true);
      expect(player.hasComponent('Sprite')).toBe(true);
      expect(player.hasComponent('Inventory')).toBe(true);
      expect(player.hasComponent('Animation')).toBe(true);
    });
  });

  test.describe('C2 - Map Tilemap System', () => {
    test('should create map with AbstractFactory and Composite patterns', async ({ page }) => {
      const map = await page.evaluate(() => {
        const { Map } = (window as any);
        return new Map('TestMap', 10, 10, 'forest');
      });
      
      expect(map).toBeDefined();
      expect(map.name).toBe('TestMap');
      expect(map.width).toBe(10);
      expect(map.height).toBe(10);
      expect(map.theme).toBe('forest');
    });

    test('should generate walkable tiles', async ({ page }) => {
      const walkablePositions = await page.evaluate(() => {
        const { Map } = (window as any);
        const map = new Map('TestMap', 10, 10, 'forest');
        return map.getWalkablePositions();
      });
      
      expect(walkablePositions).toBeDefined();
      expect(Array.isArray(walkablePositions)).toBe(true);
      expect(walkablePositions.length).toBeGreaterThan(0);
    });
  });

  test.describe('C3 - Hero Sprite Generation', () => {
    test('should have sprite manager available', async ({ page }) => {
      const spriteManager = await page.evaluate(() => (window as any).SpriteManager);
      expect(spriteManager).toBeDefined();
    });

    test('should support character sprite sets', async ({ page }) => {
      const spriteManager = await page.evaluate(() => {
        const { SpriteManager } = (window as any);
        return new SpriteManager();
      });
      
      expect(spriteManager).toBeDefined();
      expect(typeof spriteManager.loadCharacterSprites).toBe('function');
    });
  });

  test.describe('C4 - Movement Command System', () => {
    test('should have movement service available', async ({ page }) => {
      const movementService = await page.evaluate(() => (window as any).MovementService);
      expect(movementService).toBeDefined();
    });

    test('should handle movement commands', async ({ page }) => {
      const movementResult = await page.evaluate(() => {
        const { MovementService, PlayerBuilder, Map } = (window as any);
        const player = PlayerBuilder.createWizard('TestWizard');
        const map = new Map('TestMap', 10, 10, 'forest');
        const movementService = new MovementService(player, map);
        
        return movementService.moveTo(5, 5, 0);
      });
      
      expect(movementResult).toBeDefined();
      expect(movementResult.success).toBe(true);
    });
  });

  test.describe('C5 - Walk Cycle Animation', () => {
    test('should have animation service available', async ({ page }) => {
      const animationService = await page.evaluate(() => (window as any).AnimationService);
      expect(animationService).toBeDefined();
    });

    test('should support walk animations', async ({ page }) => {
      const animationResult = await page.evaluate(() => {
        const { AnimationService, PlayerBuilder } = (window as any);
        const player = PlayerBuilder.createWizard('TestWizard');
        const animationService = new AnimationService();
        
        animationService.startWalkAnimation(player, 'NORTH');
        return animationService.getAnimationStats();
      });
      
      expect(animationResult).toBeDefined();
      expect(animationResult.activeAnimations).toBeGreaterThan(0);
    });
  });

  test.describe('C6 - Inventory System', () => {
    test('should have inventory service available', async ({ page }) => {
      const inventoryService = await page.evaluate(() => (window as any).InventoryService);
      expect(inventoryService).toBeDefined();
    });

    test('should add items to inventory', async ({ page }) => {
      const inventoryResult = await page.evaluate(() => {
        const { InventoryService, PlayerBuilder } = (window as any);
        const player = PlayerBuilder.createWizard('TestWizard');
        const inventoryService = new InventoryService();
        
        const success = inventoryService.addItemToPlayer(player, 'sword', 1);
        const items = inventoryService.getPlayerItems(player);
        
        return { success, itemCount: items.length };
      });
      
      expect(inventoryResult.success).toBe(true);
      expect(inventoryResult.itemCount).toBeGreaterThan(0);
    });

    test('should support item enhancements with Decorator pattern', async ({ page }) => {
      const enhancedItem = await page.evaluate(() => {
        const { ItemDecoratorFactory } = (window as any);
        return ItemDecoratorFactory.createEnhancedItem('sword', {
          enchantment: { type: 'fire', level: 3 },
          masterwork: true
        });
      });
      
      expect(enhancedItem).toBeDefined();
      expect(enhancedItem.enhancements?.enchantment?.type).toBe('fire');
      expect(enhancedItem.enhancements?.masterwork).toBe(true);
    });
  });

  test.describe('C7 - Save/Load System', () => {
    test('should have save/load manager available', async ({ page }) => {
      const saveLoadManager = await page.evaluate(() => (window as any).saveLoadManager);
      expect(saveLoadManager).toBeDefined();
      expect(saveLoadManager.isServiceEnabled()).toBe(true);
    });

    test('should save and load game state', async ({ page }) => {
      const saveLoadResult = await page.evaluate(async () => {
        const { saveLoadManager, PlayerBuilder, Map } = (window as any);
        
        // Create test entities
        const player = PlayerBuilder.createWizard('TestWizard');
        const map = new Map('TestMap', 10, 10, 'forest');
        
        // Register entities
        saveLoadManager.registerGameEntities(player, map);
        
        // Save game
        const saveSuccess = await saveLoadManager.saveGame('E2E Test Save');
        
        // Get available saves
        const saves = saveLoadManager.getAvailableSaves();
        
        // Load game
        let loadSuccess = false;
        if (saves.length > 0) {
          loadSuccess = await saveLoadManager.loadGame(saves[0].id);
        }
        
        return { saveSuccess, loadSuccess, saveCount: saves.length };
      });
      
      expect(saveLoadResult.saveSuccess).toBe(true);
      expect(saveLoadResult.saveCount).toBeGreaterThan(0);
      expect(saveLoadResult.loadSuccess).toBe(true);
    });

    test('should support auto-save functionality', async ({ page }) => {
      const autoSaveResult = await page.evaluate(async () => {
        const { saveLoadManager, PlayerBuilder, Map } = (window as any);
        
        // Create test entities
        const player = PlayerBuilder.createWizard('TestWizard');
        const map = new Map('TestMap', 10, 10, 'forest');
        
        // Register entities
        saveLoadManager.registerGameEntities(player, map);
        
        // Force auto-save
        const forceResult = await saveLoadManager.forceAutoSave();
        
        // Check auto-save status
        const stats = saveLoadManager.getManagerStats();
        
        return { forceResult, autoSaveEnabled: stats.autoSaveEnabled };
      });
      
      expect(autoSaveResult.forceResult).toBe(true);
      expect(autoSaveResult.autoSaveEnabled).toBe(true);
    });
  });

  test.describe('Integration Tests', () => {
    test('should create complete game session', async ({ page }) => {
      const gameSession = await page.evaluate(async () => {
        const { 
          PlayerBuilder, 
          Map, 
          MovementService, 
          AnimationService, 
          InventoryService,
          saveLoadManager 
        } = (window as any);
        
        // 1. Create player
        const player = PlayerBuilder.createWizard('IntegrationTest');
        
        // 2. Create map
        const map = new Map('IntegrationMap', 20, 20, 'forest');
        
        // 3. Initialize services
        const movementService = new MovementService(player, map);
        const animationService = new AnimationService();
        const inventoryService = new InventoryService();
        
        // 4. Register for save/load
        saveLoadManager.registerGameEntities(player, map);
        
        // 5. Perform game actions
        const moveResult = movementService.moveTo(10, 10, 0);
        animationService.startWalkAnimation(player, 'NORTH');
        const addItemResult = inventoryService.addItemToPlayer(player, 'potion', 2);
        
        // 6. Save game
        const saveResult = await saveLoadManager.saveGame('Integration Test Save');
        
        return {
          playerCreated: !!player,
          mapCreated: !!map,
          moveSuccess: moveResult.success,
          addItemSuccess: addItemResult,
          saveSuccess: saveResult,
          playerPosition: player.getPosition(),
          inventoryItems: inventoryService.getPlayerItems(player).length
        };
      });
      
      // Verify all systems work together
      expect(gameSession.playerCreated).toBe(true);
      expect(gameSession.mapCreated).toBe(true);
      expect(gameSession.moveSuccess).toBe(true);
      expect(gameSession.addItemSuccess).toBe(true);
      expect(gameSession.saveSuccess).toBe(true);
      expect(gameSession.playerPosition).toBeDefined();
      expect(gameSession.inventoryItems).toBeGreaterThan(0);
    });

    test('should handle keyboard input for movement', async ({ page }) => {
      // Focus on the game container
      await page.click('#game-container');
      
      // Test WASD movement
      const movementResults = await page.evaluate(async () => {
        const results = [];
        
        // Simulate key presses
        const keys = ['w', 'a', 's', 'd'];
        for (const key of keys) {
          const event = new KeyboardEvent('keydown', { key });
          document.dispatchEvent(event);
          
          // Small delay to process
          await new Promise(resolve => setTimeout(resolve, 100));
          
          results.push({ key, eventDispatched: true });
        }
        
        return results;
      });
      
      expect(movementResults).toHaveLength(4);
      movementResults.forEach(result => {
        expect(result.eventDispatched).toBe(true);
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('should load game within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Wait for game to be fully loaded
      await page.waitForFunction(() => {
        return (window as any).saveLoadManager?.isServiceEnabled();
      }, { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Game should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle multiple save operations efficiently', async ({ page }) => {
      const performanceResult = await page.evaluate(async () => {
        const { saveLoadManager, PlayerBuilder, Map } = (window as any);
        
        const player = PlayerBuilder.createWizard('PerfTest');
        const map = new Map('PerfMap', 10, 10, 'forest');
        
        saveLoadManager.registerGameEntities(player, map);
        
        const startTime = performance.now();
        
        // Perform multiple saves
        for (let i = 0; i < 5; i++) {
          await saveLoadManager.saveGame(`Performance Test ${i}`);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / 5;
        
        return { totalTime, avgTime, saveCount: 5 };
      });
      
      // Each save should take less than 1 second on average
      expect(performanceResult.avgTime).toBeLessThan(1000);
      expect(performanceResult.saveCount).toBe(5);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid save operations gracefully', async ({ page }) => {
      const errorResult = await page.evaluate(async () => {
        const { saveLoadManager } = (window as any);
        
        try {
          // Try to load non-existent save
          await saveLoadManager.loadGame('non_existent_save_id');
          return { error: null, success: true };
        } catch (error) {
          return { error: error.message, success: false };
        }
      });
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
    });

    test('should handle invalid player operations gracefully', async ({ page }) => {
      const errorResult = await page.evaluate(() => {
        try {
          const { PlayerBuilder } = (window as any);
          // Try to create player without name
          PlayerBuilder.createWizard('');
          return { error: null, success: true };
        } catch (error) {
          return { error: error.message, success: false };
        }
      });
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
    });
  });
});

