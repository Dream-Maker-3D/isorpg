/**
 * @pattern Demo
 * @description Demo script showcasing save/load functionality
 */

import { SaveLoadManager } from '../src/domain/service/SaveLoadManager';
import { PlayerBuilder } from '../src/patterns/creational/Builder/PlayerBuilder';
import { Map } from '../src/domain/entity/Map';

/**
 * @pattern Demo
 * @description Save/load functionality demonstration
 */
export class SaveLoadDemo {
  private saveLoadManager: SaveLoadManager;
  private player: any;
  private map: any;

  constructor() {
    this.saveLoadManager = new SaveLoadManager();
    this.setupDemoEntities();
  }

  /**
   * @pattern Demo
   * @description Setup demo entities for testing
   */
  private async setupDemoEntities(): Promise<void> {
    try {
      // Initialize the save/load manager
      await this.saveLoadManager.initialize();
      console.log('✅ Save/load manager initialized');

      // Create demo player and map
      this.player = PlayerBuilder.createWizard('DemoWizard');
      this.map = new Map('DemoMap', 20, 20, 'forest');

      // Register entities
      this.saveLoadManager.registerGameEntities(this.player, this.map);
      console.log('✅ Demo entities registered');

    } catch (error) {
      console.error('❌ Failed to setup demo entities:', error);
    }
  }

  /**
   * @pattern Demo
   * @description Run the complete save/load demo
   */
  public async runDemo(): Promise<void> {
    console.log('🎮 Starting Save/Load Demo...\n');

    try {
      // Wait for initialization
      await this.waitForInitialization();

      // Demo 1: Basic save/load
      await this.demoBasicSaveLoad();

      // Demo 2: Multiple saves
      await this.demoMultipleSaves();

      // Demo 3: Auto-save functionality
      await this.demoAutoSave();

      // Demo 4: Save management
      await this.demoSaveManagement();

      console.log('\n🎉 Save/Load Demo completed successfully!');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  /**
   * @pattern Demo
   * @description Wait for system initialization
   */
  private async waitForInitialization(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const stats = this.saveLoadManager.getManagerStats();
      if (stats.initialized) {
        break;
      }
      
      await this.delay(500);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to initialize save/load manager');
    }
  }

  /**
   * @pattern Demo
   * @description Demo basic save and load functionality
   */
  private async demoBasicSaveLoad(): Promise<void> {
    console.log('📝 Demo 1: Basic Save/Load');
    console.log('  - Saving game...');

    // Save the game
    const saveResult = await this.saveLoadManager.saveGame('Demo Save 1');
    if (saveResult) {
      console.log('  ✅ Game saved successfully');
    } else {
      console.log('  ❌ Failed to save game');
      return;
    }

    // Get available saves
    const saves = this.saveLoadManager.getAvailableSaves();
    console.log(`  📁 Available saves: ${saves.length}`);

    if (saves.length > 0) {
      const firstSave = saves[0];
      console.log(`  🔍 First save: ${firstSave.saveName} (${firstSave.playerName})`);

      // Load the game
      console.log('  - Loading game...');
      const loadResult = await this.saveLoadManager.loadGame(firstSave.id);
      
      if (loadResult) {
        console.log('  ✅ Game loaded successfully');
      } else {
        console.log('  ❌ Failed to load game');
      }
    }

    console.log('');
  }

  /**
   * @pattern Demo
   * @description Demo multiple saves functionality
   */
  private async demoMultipleSaves(): Promise<void> {
    console.log('📚 Demo 2: Multiple Saves');
    console.log('  - Creating multiple saves...');

    // Create several saves
    const saveNames = ['Morning Session', 'Afternoon Session', 'Evening Session'];
    
    for (const saveName of saveNames) {
      const result = await this.saveLoadManager.saveGame(saveName);
      if (result) {
        console.log(`  ✅ Saved: ${saveName}`);
      } else {
        console.log(`  ❌ Failed to save: ${saveName}`);
      }
    }

    // List all saves
    const saves = this.saveLoadManager.getAvailableSaves();
    console.log(`  📁 Total saves: ${saves.length}`);
    
    saves.forEach((save, index) => {
      console.log(`    ${index + 1}. ${save.saveName} - ${save.playerName} (${save.characterClass})`);
    });

    console.log('');
  }

  /**
   * @pattern Demo
   * @description Demo auto-save functionality
   */
  private async demoAutoSave(): Promise<void> {
    console.log('⏰ Demo 3: Auto-save Functionality');
    
    // Check auto-save status
    const stats = this.saveLoadManager.getManagerStats();
    console.log(`  🔄 Auto-save enabled: ${stats.autoSaveEnabled}`);

    // Set a short auto-save interval for demo
    this.saveLoadManager.setAutoSaveInterval(5000); // 5 seconds
    console.log('  ⚙️  Auto-save interval set to 5 seconds');

    // Force an auto-save
    console.log('  🚀 Forcing auto-save...');
    const forceResult = await this.saveLoadManager.forceAutoSave();
    
    if (forceResult) {
      console.log('  ✅ Force auto-save completed');
    } else {
      console.log('  ❌ Force auto-save failed');
    }

    // Pause and resume auto-save
    console.log('  ⏸️  Pausing auto-save...');
    this.saveLoadManager.pauseAutoSave();
    
    console.log('  ▶️  Resuming auto-save...');
    this.saveLoadManager.resumeAutoSave();

    console.log('');
  }

  /**
   * @pattern Demo
   * @description Demo save management functionality
   */
  private async demoSaveManagement(): Promise<void> {
    console.log('🗂️  Demo 4: Save Management');
    
    // Get current save count
    const saves = this.saveLoadManager.getAvailableSaves();
    console.log(`  📊 Current save count: ${saves.length}`);

    if (saves.length > 0) {
      // Export saves
      console.log('  📤 Exporting saves...');
      const exportData = this.saveLoadManager.exportSaves();
      console.log(`  ✅ Exported ${exportData.length} characters`);

      // Get save statistics
      const serviceStats = this.saveLoadManager.getServiceStats();
      console.log(`  📈 Service stats: ${serviceStats.saveCount} saves, ${serviceStats.storageSize} bytes`);

      // Delete a save (if we have multiple)
      if (saves.length > 1) {
        const saveToDelete = saves[1];
        console.log(`  🗑️  Deleting save: ${saveToDelete.saveName}`);
        
        const deleteResult = await this.saveLoadManager.deleteSave(saveToDelete.id);
        if (deleteResult) {
          console.log('  ✅ Save deleted successfully');
        } else {
          console.log('  ❌ Failed to delete save');
        }
      }

      // Import saves back
      console.log('  📥 Importing saves...');
      try {
        await this.saveLoadManager.importSaves(exportData);
        console.log('  ✅ Saves imported successfully');
      } catch (error) {
        console.log('  ❌ Failed to import saves:', error);
      }
    }

    console.log('');
  }

  /**
   * @pattern Demo
   * @description Utility function to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @pattern Demo
   * @description Get demo statistics
   */
  public getDemoStats(): any {
    const managerStats = this.saveLoadManager.getManagerStats();
    const systemStats = this.saveLoadManager.getSystemStats();
    const serviceStats = this.saveLoadManager.getServiceStats();

    return {
      manager: managerStats,
      system: systemStats,
      service: serviceStats,
      saves: this.saveLoadManager.getAvailableSaves()
    };
  }

  /**
   * @pattern Demo
   * @description Clean up demo resources
   */
  public cleanup(): void {
    console.log('🧹 Cleaning up demo resources...');
    // Cleanup logic here if needed
  }
}

// Auto-run demo when script is loaded
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('DOMContentLoaded', async () => {
    const demo = new SaveLoadDemo();
    
    // Wait a bit for everything to initialize
    setTimeout(async () => {
      await demo.runDemo();
      
      // Expose demo globally for manual testing
      (window as any).saveLoadDemo = demo;
      console.log('💾 Save/Load Demo exposed globally as "saveLoadDemo"');
    }, 1000);
  });
} else {
  // Node.js environment
  const demo = new SaveLoadDemo();
  demo.runDemo().catch(console.error);
}

