/**
 * @pattern Singleton
 * @description ECS kernel for managing game entities, components, and systems
 */

/**
 * @pattern Observer
 * @description Event bus for system communication
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Array<(event: any) => void>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(event: string, callback: (event: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (event: any) => void): void {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  public emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }
}

/**
 * @pattern Component
 * @description Base component class for ECS architecture
 */
export abstract class Component {
  public entityId: string = '';
  public abstract type: string;

  constructor(type: string) {
    this.type = type;
  }

  public setEntityId(id: string): void {
    this.entityId = id;
  }
}

/**
 * @pattern Entity
 * @description Game entity that can have multiple components
 */
export class Entity {
  private _id: string;
  private components: Map<string, Component> = new Map();

  constructor(id: string) {
    this._id = id;
  }

  public get id(): string {
    return this._id;
  }

  public addComponent(component: Component): void {
    component.setEntityId(this._id);
    this.components.set(component.type, component);
  }

  public removeComponent(type: string): boolean {
    return this.components.delete(type);
  }

  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  public getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  public getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }
}

/**
 * @pattern System
 * @description Base system class for processing entities
 */
export abstract class System {
  protected eventBus: EventBus;
  protected enabled: boolean = true;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public abstract update(deltaTime: number): void;

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * @pattern Singleton
 * @description Main game kernel managing all systems
 */
export class GameKernel {
  private static instance: GameKernel;
  private systems: System[] = [];
  private entities: Entity[] = [];
  private eventBus: EventBus;
  private isRunning: boolean = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): GameKernel {
    if (!GameKernel.instance) {
      GameKernel.instance = new GameKernel();
    }
    return GameKernel.instance;
  }

  public async initialize(): Promise<void> {
    console.log('🎮 Initializing Game Kernel...');
    
    // Initialize systems
    this.initializeSystems();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ Game Kernel initialized successfully');
  }

  private initializeSystems(): void {
    // Systems will be added here as they're implemented
    console.log('🔧 No systems to initialize yet');
  }

  private setupEventListeners(): void {
    // Listen for entity creation/destruction
    this.eventBus.on('entity:created', (event: { entity: Entity }) => {
      this.addEntity(event.entity);
    });

    this.eventBus.on('entity:destroyed', (event: { entityId: string }) => {
      this.removeEntity(event.entityId);
    });
  }

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.eventBus.emit('entity:added', { entity });
  }

  public removeEntity(entityId: string): void {
    const index = this.entities.findIndex(e => e.id === entityId);
    if (index > -1) {
      const entity = this.entities[index];
      this.entities.splice(index, 1);
      this.eventBus.emit('entity:removed', { entity });
    }
  }

  public getEntity(entityId: string): Entity | undefined {
    return this.entities.find(e => e.id === entityId);
  }

  public getAllEntities(): Entity[] {
    return [...this.entities];
  }

  public addSystem(system: System): void {
    this.systems.push(system);
  }

  public removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index > -1) {
      this.systems.splice(index, 1);
    }
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🎮 Game Kernel started');
    
    // Start game loop
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    console.log('⏹️ Game Kernel stopped');
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - (this.lastFrameTime || currentTime);
    this.lastFrameTime = currentTime;

    // Update all systems
    this.systems.forEach(system => {
      if (system.isEnabled()) {
        try {
          system.update(deltaTime);
        } catch (error) {
          console.error('Error updating system:', error);
        }
      }
    });

    // Continue game loop
    requestAnimationFrame(() => this.gameLoop());
  }

  private lastFrameTime: number = 0;
}

