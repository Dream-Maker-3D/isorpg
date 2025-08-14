/**
 * @pattern Test
 * @description Unit tests for animation system with Observer pattern and ECS integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { CharacterClass } from '@domain/valueObject/CharacterClass';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';
import { AnimationComponent } from '@domain/entity/components/AnimationComponent';
import { AnimationSystem, AnimationEvent, MovementEvent } from '@domain/system/AnimationSystem';
import { AnimationService } from '@domain/service/AnimationService';
import { EventBus } from '@gameKernel/Kernel';
import { Direction, AnimationType } from '@domain/entity/components/AnimationComponent';

describe('Animation System', () => {
  let player: Player;
  let map: Map;
  let animationSystem: AnimationSystem;
  let animationService: AnimationService;
  let eventBus: EventBus;

  beforeEach(() => {
    // Create a simple 10x10 map
    map = new Map('TestMap', 10, 10, 'standard');
    map.generateRandomMap();

    // Create player with components
    const characterClass = CharacterClass.WARRIOR;
    const positionComponent = new PositionComponent();
    const spriteComponent = new SpriteComponent();
    const animationComponent = new AnimationComponent();

    player = new Player(
      'test-player',
      'TestPlayer',
      characterClass,
      positionComponent,
      spriteComponent,
      animationComponent
    );

    // Set player to a walkable position
    const walkablePositions = map.getWalkablePositions();
    if (walkablePositions.length > 0) {
      const pos = walkablePositions[0];
      player.setPosition(pos.x, pos.y, 0);
    }

    animationSystem = new AnimationSystem();
    animationService = new AnimationService();
    eventBus = EventBus.getInstance();
  });

  describe('Animation System', () => {
    it('should create animation system', () => {
      expect(animationSystem).toBeDefined();
    });

    it('should handle movement events', () => {
      const movementEvent: MovementEvent = {
        player: player,
        position: { x: 1, y: 1, z: 0 },
        previousPosition: { x: 0, y: 0, z: 0 },
        direction: 'east'
      };

      // Emit movement event
      eventBus.emit('player:moved', movementEvent);

      // Check that animation component was updated
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('walk');
      expect(animationComponent?.currentState.direction).toBe('east');
    });

    it('should handle movement failure events', () => {
      const movementEvent = {
        player: player,
        reason: 'Cannot move',
        position: { x: 0, y: 0, z: 0 }
      };

      // Emit movement failure event
      eventBus.emit('player:movement_failed', movementEvent);

      // Check that animation component returns to idle
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('idle');
    });

    it('should update animation system', () => {
      const currentTime = Date.now();
      animationSystem.update(currentTime);

      // Should not throw errors
      expect(animationSystem).toBeDefined();
    });

    it('should set and get animation speed', () => {
      animationSystem.setAnimationSpeed(12);
      expect(animationSystem.getAnimationSpeed()).toBe(12);
    });

    it('should clamp animation speed', () => {
      animationSystem.setAnimationSpeed(50); // Too high
      expect(animationSystem.getAnimationSpeed()).toBe(30);

      animationSystem.setAnimationSpeed(0); // Too low
      expect(animationSystem.getAnimationSpeed()).toBe(1);
    });

    it('should get active animations', () => {
      const activeAnimations = animationSystem.getActiveAnimations();
      expect(activeAnimations).toBeInstanceOf(Map);
    });

    it('should pause all animations', () => {
      animationSystem.pauseAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.isPlaying).toBe(false);
      }
    });

    it('should resume all animations', () => {
      animationSystem.resumeAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.isPlaying).toBe(true);
      }
    });

    it('should stop all animations', () => {
      animationSystem.stopAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.currentFrame).toBe(0);
        expect(animationComponent.isPlaying).toBe(false);
      }
    });

    it('should get animation statistics', () => {
      const stats = animationSystem.getAnimationStats();
      
      expect(stats.activeAnimations).toBeDefined();
      expect(stats.animationSpeed).toBeDefined();
      expect(stats.totalEntities).toBeDefined();
    });
  });

  describe('Animation Service', () => {
    it('should create animation service', () => {
      expect(animationService).toBeDefined();
    });

    it('should start walk animation', () => {
      animationService.startWalkAnimation(player, 'north');
      
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('walk');
      expect(animationComponent?.currentState.direction).toBe('north');
    });

    it('should start idle animation', () => {
      animationService.startIdleAnimation(player, 'south');
      
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('idle');
      expect(animationComponent?.currentState.direction).toBe('south');
    });

    it('should start attack animation', () => {
      animationService.startAttackAnimation(player, 'east');
      
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('attack');
      expect(animationComponent?.currentState.direction).toBe('east');
    });

    it('should start cast animation', () => {
      animationService.startCastAnimation(player, 'west');
      
      const animationComponent = player.animation;
      expect(animationComponent?.currentState.type).toBe('cast');
      expect(animationComponent?.currentState.direction).toBe('west');
    });

    it('should stop animation', () => {
      animationService.startWalkAnimation(player, 'north');
      animationService.stopAnimation(player);
      
      const animationComponent = player.animation;
      expect(animationComponent?.currentFrame).toBe(0);
      expect(animationComponent?.isPlaying).toBe(false);
    });

    it('should pause and resume animation', () => {
      animationService.startWalkAnimation(player, 'north');
      animationService.pauseAnimation(player);
      
      const animationComponent = player.animation;
      expect(animationComponent?.isPlaying).toBe(false);
      
      animationService.resumeAnimation(player);
      expect(animationComponent?.isPlaying).toBe(true);
    });

    it('should set and get animation speed', () => {
      animationService.setAnimationSpeed(15);
      expect(animationService.getAnimationSpeed()).toBe(15);
    });

    it('should enable and disable animation service', () => {
      animationService.setEnabled(false);
      expect(animationService.isAnimationEnabled()).toBe(false);
      
      animationService.setEnabled(true);
      expect(animationService.isAnimationEnabled()).toBe(true);
    });

    it('should add and remove animation callbacks', () => {
      const callback = vi.fn();
      
      animationService.onAnimationEvent('walk_started', callback);
      animationService.startWalkAnimation(player, 'north');
      
      // Callback should be triggered
      expect(callback).toHaveBeenCalled();
      
      animationService.removeAnimationCallback('walk_started');
      animationService.startWalkAnimation(player, 'south');
      
      // Callback should not be called again
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should get animation statistics', () => {
      const stats = animationService.getAnimationStats();
      
      expect(stats.activeAnimations).toBeDefined();
      expect(stats.animationSpeed).toBeDefined();
      expect(stats.totalEntities).toBeDefined();
      expect(stats.enabled).toBeDefined();
    });

    it('should get active animations', () => {
      const activeAnimations = animationService.getActiveAnimations();
      expect(activeAnimations).toBeInstanceOf(Map);
    });

    it('should pause all animations', () => {
      animationService.pauseAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.isPlaying).toBe(false);
      }
    });

    it('should resume all animations', () => {
      animationService.resumeAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.isPlaying).toBe(true);
      }
    });

    it('should stop all animations', () => {
      animationService.stopAllAnimations();
      
      const animationComponent = player.animation;
      if (animationComponent) {
        expect(animationComponent.currentFrame).toBe(0);
        expect(animationComponent.isPlaying).toBe(false);
      }
    });

    it('should get player animation state', () => {
      animationService.startWalkAnimation(player, 'north');
      
      const state = animationService.getPlayerAnimationState(player);
      expect(state).toBeDefined();
      expect(state?.type).toBe('walk');
      expect(state?.direction).toBe('north');
      expect(state?.isPlaying).toBe(true);
    });

    it('should return null for player without animation component', () => {
      const playerWithoutAnimation = new Player(
        'test-player-2',
        'TestPlayer2',
        CharacterClass.WARRIOR,
        new PositionComponent(),
        new SpriteComponent()
        // No animation component
      );
      
      const state = animationService.getPlayerAnimationState(playerWithoutAnimation);
      expect(state).toBeNull();
    });
  });

  describe('Animation Events', () => {
    it('should emit walk started event', () => {
      const callback = vi.fn();
      eventBus.subscribe('animation:walk_started', callback);
      
      animationService.startWalkAnimation(player, 'east');
      
      expect(callback).toHaveBeenCalledWith({
        entityId: player.id,
        animationType: 'walk',
        direction: 'east',
        frameIndex: 0,
        isComplete: false
      });
    });

    it('should emit frame updated events', () => {
      const callback = vi.fn();
      eventBus.subscribe('animation:frame_updated', callback);
      
      animationService.startWalkAnimation(player, 'south');
      animationService.update(Date.now());
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle animation completion', () => {
      const callback = vi.fn();
      eventBus.subscribe('animation:walk_completed', callback);
      
      // Start walk animation and let it complete
      animationService.startWalkAnimation(player, 'west');
      
      // Simulate animation completion by manually triggering
      const animationComponent = player.animation;
      if (animationComponent) {
        // Set to last frame and mark as complete
        animationComponent.setAnimation('walk', 'west');
        animationComponent.update(Date.now() + 1000); // Advance time
      }
      
      // Should transition to idle
      expect(animationComponent?.currentState.type).toBe('idle');
    });
  });
});

