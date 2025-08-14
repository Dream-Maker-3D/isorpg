/**
 * @pattern Test Runner
 * @description Programmatic test runner for e2e tests
 */

import { chromium, firefox, webkit, Browser, Page } from '@playwright/test';

/**
 * @pattern Test Runner
 * @description E2E test execution manager
 */
export class E2ETestRunner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private testResults: any[] = [];

  /**
   * @pattern Test Runner
   * @description Initialize test environment
   */
  public async initialize(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<void> {
    try {
      // Launch browser
      switch (browserType) {
        case 'chromium':
          this.browser = await chromium.launch({ headless: false });
          break;
        case 'firefox':
          this.browser = await firefox.launch({ headless: false });
          break;
        case 'webkit':
          this.browser = await webkit.launch({ headless: false });
          break;
      }

      // Create new page
      this.page = await this.browser!.newPage();
      
      console.log(`✅ ${browserType} browser launched successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${browserType} browser:`, error);
      throw error;
    }
  }

  /**
   * @pattern Test Runner
   * @description Navigate to game and wait for initialization
   */
  public async navigateToGame(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // Navigate to the game
      await this.page.goto('http://localhost:5173');
      
      // Wait for game container
      await this.page.waitForSelector('#game-container', { timeout: 10000 });
      
      // Wait for save/load manager to be available
      await this.page.waitForFunction(() => {
        return (window as any).saveLoadManager?.isServiceEnabled();
      }, { timeout: 15000 });
      
      console.log('✅ Game loaded successfully');
    } catch (error) {
      console.error('❌ Failed to navigate to game:', error);
      throw error;
    }
  }

  /**
   * @pattern Test Runner
   * @description Run smoke tests
   */
  public async runSmokeTests(): Promise<any[]> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const results = [];
    
    try {
      console.log('🧪 Running smoke tests...');
      
      // Test 1: Check if save/load manager is available
      const saveLoadManagerTest = await this.page.evaluate(() => {
        const manager = (window as any).saveLoadManager;
        return {
          test: 'Save/Load Manager Availability',
          passed: !!manager && manager.isServiceEnabled(),
          details: manager ? 'Manager found and enabled' : 'Manager not found'
        };
      });
      results.push(saveLoadManagerTest);

      // Test 2: Check if player builder is available
      const playerBuilderTest = await this.page.evaluate(() => {
        const builder = (window as any).PlayerBuilder;
        return {
          test: 'Player Builder Availability',
          passed: !!builder,
          details: builder ? 'PlayerBuilder found' : 'PlayerBuilder not found'
        };
      });
      results.push(playerBuilderTest);

      // Test 3: Check if map system is available
      const mapSystemTest = await this.page.evaluate(() => {
        const mapClass = (window as any).Map;
        return {
          test: 'Map System Availability',
          passed: !!mapClass,
          details: mapClass ? 'Map class found' : 'Map class not found'
        };
      });
      results.push(mapSystemTest);

      console.log('✅ Smoke tests completed');
    } catch (error) {
      console.error('❌ Smoke tests failed:', error);
      results.push({
        test: 'Smoke Tests Execution',
        passed: false,
        details: `Error: ${error.message}`
      });
    }

    return results;
  }

  /**
   * @pattern Test Runner
   * @description Run core functionality tests
   */
  public async runCoreTests(): Promise<any[]> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const results = [];
    
    try {
      console.log('🎯 Running core functionality tests...');
      
      // Test 1: Player Creation
      const playerCreationTest = await this.page.evaluate(() => {
        try {
          const { PlayerBuilder } = (window as any);
          const player = PlayerBuilder.createWizard('TestWizard');
          
          return {
            test: 'Player Creation',
            passed: !!player && player.name === 'TestWizard',
            details: `Player created: ${player?.name || 'failed'}`
          };
        } catch (error) {
          return {
            test: 'Player Creation',
            passed: false,
            details: `Error: ${error.message}`
          };
        }
      });
      results.push(playerCreationTest);

      // Test 2: Map Creation
      const mapCreationTest = await this.page.evaluate(() => {
        try {
          const { Map } = (window as any);
          const map = new Map('TestMap', 10, 10, 'forest');
          
          return {
            test: 'Map Creation',
            passed: !!map && map.name === 'TestMap',
            details: `Map created: ${map?.name || 'failed'}`
          };
        } catch (error) {
          return {
            test: 'Map Creation',
            passed: false,
            details: `Error: ${error.message}`
          };
        }
      });
      results.push(mapCreationTest);

      // Test 3: Save/Load Operations
      const saveLoadTest = await this.page.evaluate(async () => {
        try {
          const { saveLoadManager, PlayerBuilder, Map } = (window as any);
          
          const player = PlayerBuilder.createWizard('SaveTest');
          const map = new Map('SaveMap', 10, 10, 'forest');
          
          saveLoadManager.registerGameEntities(player, map);
          
          const saveResult = await saveLoadManager.saveGame('Core Test Save');
          const saves = saveLoadManager.getAvailableSaves();
          
          return {
            test: 'Save/Load Operations',
            passed: saveResult && saves.length > 0,
            details: `Save successful: ${saveResult}, Saves available: ${saves.length}`
          };
        } catch (error) {
          return {
            test: 'Save/Load Operations',
            passed: false,
            details: `Error: ${error.message}`
          };
        }
      });
      results.push(saveLoadTest);

      console.log('✅ Core functionality tests completed');
    } catch (error) {
      console.error('❌ Core functionality tests failed:', error);
      results.push({
        test: 'Core Functionality Tests Execution',
        passed: false,
        details: `Error: ${error.message}`
      });
    }

    return results;
  }

  /**
   * @pattern Test Runner
   * @description Run integration tests
   */
  public async runIntegrationTests(): Promise<any[]> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const results = [];
    
    try {
      console.log('🔗 Running integration tests...');
      
      // Test: Complete game session
      const integrationTest = await this.page.evaluate(async () => {
        try {
          const { 
            PlayerBuilder, 
            Map, 
            MovementService, 
            AnimationService, 
            InventoryService,
            saveLoadManager 
          } = (window as any);
          
          // Create all components
          const player = PlayerBuilder.createWizard('IntegrationTest');
          const map = new Map('IntegrationMap', 20, 20, 'forest');
          
          // Initialize services
          const movementService = new MovementService(player, map);
          const animationService = new AnimationService();
          const inventoryService = new InventoryService();
          
          // Register for save/load
          saveLoadManager.registerGameEntities(player, map);
          
          // Perform actions
          const moveResult = movementService.moveTo(10, 10, 0);
          animationService.startWalkAnimation(player, 'NORTH');
          const addItemResult = inventoryService.addItemToPlayer(player, 'potion', 2);
          
          // Save game
          const saveResult = await saveLoadManager.saveGame('Integration Test Save');
          
          return {
            test: 'System Integration',
            passed: moveResult.success && addItemResult && saveResult,
            details: `Move: ${moveResult.success}, Add Item: ${addItemResult}, Save: ${saveResult}`
          };
        } catch (error) {
          return {
            test: 'System Integration',
            passed: false,
            details: `Error: ${error.message}`
          };
        }
      });
      results.push(integrationTest);

      console.log('✅ Integration tests completed');
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      results.push({
        test: 'Integration Tests Execution',
        passed: false,
        details: `Error: ${error.message}`
      });
    }

    return results;
  }

  /**
   * @pattern Test Runner
   * @description Run all tests
   */
  public async runAllTests(): Promise<any[]> {
    try {
      console.log('🚀 Starting comprehensive e2e test suite...\n');
      
      // Run all test categories
      const smokeResults = await this.runSmokeTests();
      const coreResults = await this.runCoreTests();
      const integrationResults = await this.runIntegrationTests();
      
      // Combine all results
      this.testResults = [...smokeResults, ...coreResults, ...integrationResults];
      
      // Generate summary
      const totalTests = this.testResults.length;
      const passedTests = this.testResults.filter(r => r.passed).length;
      const failedTests = totalTests - passedTests;
      
      console.log('\n📊 Test Results Summary:');
      console.log(`Total Tests: ${totalTests}`);
      console.log(`Passed: ${passedTests} ✅`);
      console.log(`Failed: ${failedTests} ❌`);
      console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
      
      // Show failed tests
      if (failedTests > 0) {
        console.log('\n❌ Failed Tests:');
        this.testResults
          .filter(r => !r.passed)
          .forEach(result => {
            console.log(`  - ${result.test}: ${result.details}`);
          });
      }
      
      return this.testResults;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  /**
   * @pattern Test Runner
   * @description Get test results
   */
  public getTestResults(): any[] {
    return this.testResults;
  }

  /**
   * @pattern Test Runner
   * @description Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('🧹 Test resources cleaned up');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Auto-run if this script is executed directly
if (require.main === module) {
  (async () => {
    const runner = new E2ETestRunner();
    
    try {
      await runner.initialize('chromium');
      await runner.navigateToGame();
      await runner.runAllTests();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  })();
}

