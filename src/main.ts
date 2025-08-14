/**
 * @pattern Singleton
 * @description Main application entry point and game bootstrap
 */

import { GameKernel } from '@gameKernel/Kernel';
import { SaveLoadManager } from '@domain/service/SaveLoadManager';

/**
 * @pattern Template Method
 * @description Application bootstrap with initialization sequence
 */
class Application {
  private static instance: Application;
  private kernel: GameKernel;
  private saveLoadManager: SaveLoadManager;

  private constructor() {
    this.kernel = GameKernel.getInstance();
    this.saveLoadManager = new SaveLoadManager();
  }

  public static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  public async initialize(): Promise<void> {
    console.log('🚀 Initializing Isometric RPG...');
    
    try {
      // Initialize save/load manager first
      await this.saveLoadManager.initialize();
      console.log('✅ Save/load manager initialized successfully');
      
      // Initialize game kernel
      await this.kernel.initialize();
      console.log('✅ Game kernel initialized successfully');
      
      // Setup save/load event listeners
      this.setupSaveLoadListeners();
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  public start(): void {
    console.log('🎮 Starting game...');
    this.kernel.start();
  }

  /**
   * @pattern Observer
   * @description Setup save/load event listeners
   */
  private setupSaveLoadListeners(): void {
    // Listen to save/load manager events
    this.saveLoadManager.onSaveLoadEvent('save_ready', (event) => {
      console.log('🎯 Save ready:', event);
    });
    
    this.saveLoadManager.onSaveLoadEvent('load_ready', (event) => {
      console.log('📂 Load ready:', event);
    });
    
    this.saveLoadManager.onSaveLoadEvent('save_progress', (event) => {
      console.log('⏳ Save progress:', event);
    });
    
    this.saveLoadManager.onSaveLoadEvent('load_progress', (event) => {
      console.log('⏳ Load progress:', event);
    });
  }

  /**
   * @pattern Facade
   * @description Get save/load manager instance
   */
  public getSaveLoadManager(): SaveLoadManager {
    return this.saveLoadManager;
  }

  /**
   * @pattern Facade
   * @description Get game kernel instance
   */
  public getGameKernel(): GameKernel {
    return this.kernel;
  }
}

// Bootstrap the application
document.addEventListener('DOMContentLoaded', async () => {
  const app = Application.getInstance();
  
  try {
    await app.initialize();
    app.start();
    
    // Expose save/load manager globally for testing
    (window as any).saveLoadManager = app.getSaveLoadManager();
    console.log('💾 Save/load manager exposed globally for testing');
    
  } catch (error) {
    console.error('Failed to start application:', error);
    document.body.innerHTML = '<h1>Failed to load game</h1><p>Please refresh the page.</p>';
  }
});
