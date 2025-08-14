/**
 * @pattern Facade
 * @description Animation service that integrates animation system with movement and ECS events
 */

import { AnimationSystem, AnimationEvent, MovementEvent } from '@domain/system/AnimationSystem';
import { EventBus } from '@gameKernel/Kernel';
import { Direction, AnimationType } from '@domain/entity/components/AnimationComponent';
import { Player } from '@domain/entity/Player';

/**
 * @pattern Facade
 * @description Animation service providing simplified interface to animation system
 */
export class AnimationService {
  private animationSystem: AnimationSystem;
  private eventBus: EventBus;
  private isEnabled: boolean = true;
  private animationCallbacks: Map<string, (event: AnimationEvent) => void> = new Map();

  constructor() {
    this.animationSystem = new AnimationSystem();
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  /**
   * @pattern Observer
   * @description Set up event listeners for animation events
   */
  private setupEventListeners(): void {
    // Listen for animation events
    this.eventBus.subscribe('animation:walk_started', (event: AnimationEvent) => {
      this.handleAnimationEvent('walk_started', event);
    });

    this.eventBus.subscribe('animation:walk_completed', (event: AnimationEvent) => {
      this.handleAnimationEvent('walk_completed', event);
    });

    this.eventBus.subscribe('animation:frame_updated', (event: AnimationEvent) => {
      this.handleAnimationEvent('frame_updated', event);
    });

    this.eventBus.subscribe('animation:state_changed', (event: AnimationEvent) => {
      this.handleAnimationEvent('state_changed', event);
    });
  }

  /**
   * @pattern Observer
   * @description Handle animation events and trigger callbacks
   */
  private handleAnimationEvent(eventType: string, event: AnimationEvent): void {
    if (!this.isEnabled) {
      return;
    }

    const callbackKey = `${event.entityId}_${eventType}`;
    const callback = this.animationCallbacks.get(callbackKey);
    
    if (callback) {
      callback(event);
    }

    // Also trigger general callbacks
    const generalCallback = this.animationCallbacks.get(eventType);
    if (generalCallback) {
      generalCallback(event);
    }
  }

  /**
   * @pattern Facade
   * @description Update animation service
   */
  public update(currentTime: number): void {
    if (!this.isEnabled) {
      return;
    }

    this.animationSystem.update(currentTime);
  }

  /**
   * @pattern Facade
   * @description Start walk animation for player
   */
  public startWalkAnimation(player: Player, direction: Direction): void {
    if (!this.isEnabled) {
      return;
    }

    const animationComponent = player.animation;
    if (!animationComponent) {
      return;
    }

    animationComponent.setAnimation('walk', direction);
    animationComponent.play();

    // Emit walk started event
    this.eventBus.emit('animation:walk_started', {
      entityId: player.id,
      animationType: 'walk',
      direction: direction,
      frameIndex: 0,
      isComplete: false
    });
  }

  /**
   * @pattern Facade
   * @description Start idle animation for player
   */
  public startIdleAnimation(player: Player, direction: Direction): void {
    if (!this.isEnabled) {
      return;
    }

    const animationComponent = player.animation;
    if (!animationComponent) {
      return;
    }

    animationComponent.setAnimation('idle', direction);
    animationComponent.play();
  }

  /**
   * @pattern Facade
   * @description Start attack animation for player
   */
  public startAttackAnimation(player: Player, direction: Direction): void {
    if (!this.isEnabled) {
      return;
    }

    const animationComponent = player.animation;
    if (!animationComponent) {
      return;
    }

    animationComponent.setAnimation('attack', direction);
    animationComponent.play();

    // Emit attack started event
    this.eventBus.emit('animation:attack_started', {
      entityId: player.id,
      animationType: 'attack',
      direction: direction,
      frameIndex: 0,
      isComplete: false
    });
  }

  /**
   * @pattern Facade
   * @description Start cast animation for player
   */
  public startCastAnimation(player: Player, direction: Direction): void {
    if (!this.isEnabled) {
      return;
    }

    const animationComponent = player.animation;
    if (!animationComponent) {
      return;
    }

    animationComponent.setAnimation('cast', direction);
    animationComponent.play();

    // Emit cast started event
    this.eventBus.emit('animation:cast_started', {
      entityId: player.id,
      animationType: 'cast',
      direction: direction,
      frameIndex: 0,
      isComplete: false
    });
  }

  /**
   * @pattern Facade
   * @description Stop animation for player
   */
  public stopAnimation(player: Player): void {
    const animationComponent = player.animation;
    if (animationComponent) {
      animationComponent.stop();
    }
  }

  /**
   * @pattern Facade
   * @description Pause animation for player
   */
  public pauseAnimation(player: Player): void {
    const animationComponent = player.animation;
    if (animationComponent) {
      animationComponent.pause();
    }
  }

  /**
   * @pattern Facade
   * @description Resume animation for player
   */
  public resumeAnimation(player: Player): void {
    const animationComponent = player.animation;
    if (animationComponent) {
      animationComponent.play();
    }
  }

  /**
   * @pattern Facade
   * @description Set animation speed
   */
  public setAnimationSpeed(speed: number): void {
    this.animationSystem.setAnimationSpeed(speed);
  }

  /**
   * @pattern Facade
   * @description Get animation speed
   */
  public getAnimationSpeed(): number {
    return this.animationSystem.getAnimationSpeed();
  }

  /**
   * @pattern Facade
   * @description Enable or disable animation service
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.animationSystem.pauseAllAnimations();
    } else {
      this.animationSystem.resumeAllAnimations();
    }
  }

  /**
   * @pattern Facade
   * @description Check if animation service is enabled
   */
  public isAnimationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * @pattern Facade
   * @description Add animation event callback
   */
  public onAnimationEvent(
    eventType: string, 
    callback: (event: AnimationEvent) => void,
    entityId?: string
  ): void {
    const key = entityId ? `${entityId}_${eventType}` : eventType;
    this.animationCallbacks.set(key, callback);
  }

  /**
   * @pattern Facade
   * @description Remove animation event callback
   */
  public removeAnimationCallback(eventType: string, entityId?: string): void {
    const key = entityId ? `${entityId}_${eventType}` : eventType;
    this.animationCallbacks.delete(key);
  }

  /**
   * @pattern Facade
   * @description Get animation statistics
   */
  public getAnimationStats(): {
    activeAnimations: number;
    animationSpeed: number;
    totalEntities: number;
    enabled: boolean;
  } {
    const stats = this.animationSystem.getAnimationStats();
    return {
      ...stats,
      enabled: this.isEnabled
    };
  }

  /**
   * @pattern Facade
   * @description Get active animations
   */
  public getActiveAnimations(): Map<string, AnimationEvent> {
    return this.animationSystem.getActiveAnimations();
  }

  /**
   * @pattern Facade
   * @description Pause all animations
   */
  public pauseAllAnimations(): void {
    this.animationSystem.pauseAllAnimations();
  }

  /**
   * @pattern Facade
   * @description Resume all animations
   */
  public resumeAllAnimations(): void {
    this.animationSystem.resumeAllAnimations();
  }

  /**
   * @pattern Facade
   * @description Stop all animations
   */
  public stopAllAnimations(): void {
    this.animationSystem.stopAllAnimations();
  }

  /**
   * @pattern Facade
   * @description Get current animation state for player
   */
  public getPlayerAnimationState(player: Player): {
    type: AnimationType;
    direction: Direction;
    frame: number;
    isPlaying: boolean;
    isComplete: boolean;
  } | null {
    const animationComponent = player.animation;
    if (!animationComponent) {
      return null;
    }

    return {
      type: animationComponent.currentState.type,
      direction: animationComponent.currentState.direction,
      frame: animationComponent.currentFrame,
      isPlaying: animationComponent.isPlaying,
      isComplete: animationComponent.isComplete()
    };
  }
}


