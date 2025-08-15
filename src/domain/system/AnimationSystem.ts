/**
 * @pattern System
 * @description Animation system that manages walk cycles and animation state
 */

import { System } from '@gameKernel/Kernel';
import { Entity } from '@gameKernel/Kernel';
import { AnimationComponent, Direction, AnimationType } from '@domain/entity/components/AnimationComponent';
import { EventBus } from '@gameKernel/Kernel';

/**
 * @pattern Observer
 * @description Animation event data
 */
export interface AnimationEvent {
  entityId: string;
  animationType: AnimationType;
  direction: Direction;
  frameIndex: number;
  isComplete: boolean;
}

/**
 * @pattern Observer
 * @description Movement event data
 */
export interface MovementEvent {
  player: Entity;
  position: { x: number; y: number; z: number };
  previousPosition?: { x: number; y: number; z: number };
  direction: Direction;
}

/**
 * @pattern System
 * @description Animation system that manages entity animations
 */
export class AnimationSystem extends System {
  private eventBus: EventBus;
  private animationSpeed: number = 8; // frames per second
  private lastUpdateTime: number = 0;
  private activeAnimations: Map<string, AnimationEvent> = new Map();
  private entities: Entity[] = [];

  constructor() {
    super();
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  /**
   * @pattern System
   * @description Add entity to the system
   */
  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  /**
   * @pattern System
   * @description Remove entity from the system
   */
  public removeEntity(entityId: string): void {
    const index = this.entities.findIndex(e => e.id === entityId);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * @pattern System
   * @description Get entities with specific component
   */
  private getEntitiesWithComponent(componentType: string): Entity[] {
    return this.entities.filter(entity => entity.hasComponent(componentType));
  }

  /**
   * @pattern Observer
   * @description Set up event listeners for movement and animation events
   */
  private setupEventListeners(): void {
    // Listen for player movement events
    this.eventBus.on('player:moved', (event: MovementEvent) => {
      this.handleMovementEvent(event);
    });

    // Listen for movement failure events
    this.eventBus.on('player:movement_failed', (event: any) => {
      this.handleMovementFailure(event);
    });

    // Listen for animation state changes
    this.eventBus.on('animation:state_changed', (event: AnimationEvent) => {
      this.handleAnimationStateChange(event);
    });
  }

  /**
   * @pattern Observer
   * @description Handle player movement events
   */
  private handleMovementEvent(event: MovementEvent): void {
    const entity = event.player;
    const animationComponent = entity.getComponent<AnimationComponent>('Animation');
    
    if (!animationComponent) {
      return;
    }

    // Start walk animation in the movement direction
    this.startWalkAnimation(animationComponent, event.direction);
    
    // Add to active animations
    this.activeAnimations.set(entity.id, {
      entityId: entity.id,
      animationType: 'walk',
      direction: event.direction,
      frameIndex: 0,
      isComplete: false
    });
    
    // Emit animation start event
    this.eventBus.emit('animation:walk_started', {
      entityId: entity.id,
      animationType: 'walk',
      direction: event.direction,
      frameIndex: 0,
      isComplete: false
    });
  }

  /**
   * @pattern Observer
   * @description Handle movement failure events
   */
  private handleMovementFailure(event: any): void {
    const entity = event.player;
    const animationComponent = entity.getComponent<AnimationComponent>('Animation');
    
    if (!animationComponent) {
      return;
    }

    // Return to idle animation
    this.startIdleAnimation(animationComponent, animationComponent.direction);
  }

  /**
   * @pattern Observer
   * @description Handle animation state change events
   */
  private handleAnimationStateChange(event: AnimationEvent): void {
    this.activeAnimations.set(event.entityId, event);
    
    if (event.isComplete) {
      this.activeAnimations.delete(event.entityId);
    }
  }

  /**
   * @pattern System
   * @description Update animation system
   */
  public update(currentTime: number): void {
    const deltaTime = currentTime - this.lastUpdateTime;
    
    if (deltaTime < (1000 / this.animationSpeed)) {
      return; // Not time to update yet
    }

    this.lastUpdateTime = currentTime;

    // Update all entities with animation components
    const entities = this.getEntitiesWithComponent('Animation');
    
    for (const entity of entities) {
      const animationComponent = entity.getComponent<AnimationComponent>('Animation');
      if (animationComponent) {
        this.updateEntityAnimation(entity, animationComponent, currentTime);
      }
    }
  }

  /**
   * @pattern System
   * @description Update animation for a specific entity
   */
  private updateEntityAnimation(
    entity: Entity, 
    animationComponent: AnimationComponent, 
    currentTime: number
  ): void {
    // Update the animation component
    animationComponent.update(currentTime);

    // Check if animation completed
    if (animationComponent.isComplete()) {
      this.handleAnimationComplete(entity, animationComponent);
    }

    // Emit frame update event
    this.eventBus.emit('animation:frame_updated', {
      entityId: entity.id,
      animationType: animationComponent.currentState.type,
      direction: animationComponent.currentState.direction,
      frameIndex: animationComponent.currentFrame,
      isComplete: animationComponent.isComplete()
    });
  }

  /**
   * @pattern System
   * @description Handle animation completion
   */
  private handleAnimationComplete(entity: Entity, animationComponent: AnimationComponent): void {
    const currentType = animationComponent.currentState.type;
    
    if (currentType === 'walk') {
      // Transition from walk to idle
      this.startIdleAnimation(animationComponent, animationComponent.currentState.direction);
      
      // Remove from active animations
      this.activeAnimations.delete(entity.id);
      
      this.eventBus.emit('animation:walk_completed', {
        entityId: entity.id,
        animationType: 'walk',
        direction: animationComponent.currentState.direction,
        frameIndex: animationComponent.currentFrame,
        isComplete: true
      });
    }
  }

  /**
   * @pattern System
   * @description Start walk animation
   */
  private startWalkAnimation(animationComponent: AnimationComponent, direction: Direction): void {
    animationComponent.setAnimation('walk', direction);
    animationComponent.play();
  }

  /**
   * @pattern System
   * @description Start idle animation
   */
  private startIdleAnimation(animationComponent: AnimationComponent, direction: Direction): void {
    animationComponent.setAnimation('idle', direction);
    animationComponent.play();
  }

  /**
   * @pattern System
   * @description Set animation speed
   */
  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(1, Math.min(30, speed)); // Clamp between 1-30 fps
  }

  /**
   * @pattern System
   * @description Get animation speed
   */
  public getAnimationSpeed(): number {
    return this.animationSpeed;
  }

  /**
   * @pattern System
   * @description Get active animations
   */
  public getActiveAnimations(): Map<string, AnimationEvent> {
    return new Map(this.activeAnimations);
  }

  /**
   * @pattern System
   * @description Pause all animations
   */
  public pauseAllAnimations(): void {
    const entities = this.getEntitiesWithComponent('Animation');
    
    for (const entity of entities) {
      const animationComponent = entity.getComponent<AnimationComponent>('Animation');
      if (animationComponent) {
        animationComponent.pause();
      }
    }
  }

  /**
   * @pattern System
   * @description Resume all animations
   */
  public resumeAllAnimations(): void {
    const entities = this.getEntitiesWithComponent('Animation');
    
    for (const entity of entities) {
      const animationComponent = entity.getComponent<AnimationComponent>('Animation');
      if (animationComponent) {
        animationComponent.play();
      }
    }
  }

  /**
   * @pattern System
   * @description Stop all animations
   */
  public stopAllAnimations(): void {
    const entities = this.getEntitiesWithComponent('Animation');
    
    for (const entity of entities) {
      const animationComponent = entity.getComponent<AnimationComponent>('Animation');
      if (animationComponent) {
        animationComponent.stop();
      }
    }
    
    this.activeAnimations.clear();
  }

  /**
   * @pattern System
   * @description Get animation statistics
   */
  public getAnimationStats(): {
    activeAnimations: number;
    animationSpeed: number;
    totalEntities: number;
  } {
    const entities = this.getEntitiesWithComponent('Animation');
    
    return {
      activeAnimations: this.activeAnimations.size,
      animationSpeed: this.animationSpeed,
      totalEntities: entities.length
    };
  }
}


