/**
 * @pattern Test
 * @description Unit tests for animation system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationComponent, Direction, AnimationType, AnimationConfig } from '@domain/entity/components/AnimationComponent';
import { SpriteManager } from '@domain/service/SpriteManager';

describe('Animation System', () => {
  let animationComponent: AnimationComponent;
  let spriteManager: SpriteManager;

  beforeEach(() => {
    animationComponent = new AnimationComponent();
    spriteManager = SpriteManager.getInstance();
    spriteManager.clear();
  });

  describe('AnimationComponent', () => {
    it('should create with default idle state', () => {
      expect(animationComponent.currentState.type).toBe('idle');
      expect(animationComponent.currentState.direction).toBe('south');
      expect(animationComponent.currentState.currentFrame).toBe(0);
      expect(animationComponent.currentState.isPlaying).toBe(true);
    });

    it('should add animation configurations', () => {
      const config: AnimationConfig = {
        type: 'walk',
        direction: 'north',
        totalFrames: 4,
        frameRate: 8,
        isLooping: true
      };

      animationComponent.addAnimation(config);
      animationComponent.setAnimation('walk', 'north');

      expect(animationComponent.currentState.type).toBe('walk');
      expect(animationComponent.currentState.direction).toBe('north');
      expect(animationComponent.currentState.totalFrames).toBe(4);
      expect(animationComponent.currentState.frameRate).toBe(8);
    });

    it('should update animation frames', () => {
      const config: AnimationConfig = {
        type: 'walk',
        direction: 'south',
        totalFrames: 4,
        frameRate: 8,
        isLooping: true
      };

      animationComponent.addAnimation(config);
      animationComponent.setAnimation('walk', 'south');

      // Update animation (125ms = 8fps)
      animationComponent.update(125);
      expect(animationComponent.currentFrame).toBe(1);

      animationComponent.update(250);
      expect(animationComponent.currentFrame).toBe(2);
    });

    it('should loop animation when complete', () => {
      const config: AnimationConfig = {
        type: 'walk',
        direction: 'south',
        totalFrames: 2,
        frameRate: 8,
        isLooping: true
      };

      animationComponent.addAnimation(config);
      animationComponent.setAnimation('walk', 'south');

      // Advance to last frame
      animationComponent.update(125);
      animationComponent.update(250);

      // Should loop back to 0
      animationComponent.update(375);
      expect(animationComponent.currentFrame).toBe(0);
    });

    it('should stop non-looping animations', () => {
      const config: AnimationConfig = {
        type: 'attack',
        direction: 'south',
        totalFrames: 2,
        frameRate: 8,
        isLooping: false
      };

      animationComponent.addAnimation(config);
      animationComponent.setAnimation('attack', 'south');

      // Advance to last frame
      animationComponent.update(125);
      animationComponent.update(250);

      // Should stop at last frame
      animationComponent.update(375);
      expect(animationComponent.currentFrame).toBe(1);
      expect(animationComponent.isPlaying).toBe(false);
    });

    it('should get correct texture key', () => {
      const config: AnimationConfig = {
        type: 'walk',
        direction: 'east',
        totalFrames: 4,
        frameRate: 8
      };

      animationComponent.addAnimation(config);
      animationComponent.setAnimation('walk', 'east');

      expect(animationComponent.getTextureKey()).toBe('walk_east_0');

      animationComponent.update(125);
      expect(animationComponent.getTextureKey()).toBe('walk_east_1');
    });

    it('should control animation playback', () => {
      animationComponent.pause();
      expect(animationComponent.isPlaying).toBe(false);

      animationComponent.play();
      expect(animationComponent.isPlaying).toBe(true);

      animationComponent.stop();
      expect(animationComponent.currentFrame).toBe(0);
      expect(animationComponent.isPlaying).toBe(false);
    });
  });

  describe('SpriteManager', () => {
    it('should load character sprite sets', async () => {
      const characterSet = await spriteManager.loadCharacterSprites('warrior');
      
      expect(characterSet.characterClass).toBe('warrior');
      expect(characterSet.animations.size).toBeGreaterThan(0);
    });

    it('should get animation frames for character', async () => {
      await spriteManager.loadCharacterSprites('wizard');
      
      const frames = spriteManager.getAnimationFrames('wizard', 'walk', 'south');
      expect(frames).toBeDefined();
      expect(frames?.length).toBe(4); // 4 walk frames
    });

    it('should get current frame texture', async () => {
      await spriteManager.loadCharacterSprites('archer');
      
      const texture = spriteManager.getCurrentFrameTexture('archer', 'idle', 'north', 0);
      expect(texture).toBeDefined();
      expect(texture?.key).toBe('archer_idle_north_0');
    });

    it('should preload all characters', async () => {
      await spriteManager.preloadAllCharacters();
      
      const stats = spriteManager.getStats();
      expect(stats.loaded).toBe(true);
      expect(stats.totalCharacterSets).toBe(4); // warrior, wizard, archer, rogue
    });

    it('should cache loaded textures', async () => {
      const texture1 = await spriteManager.loadTexture('test_sprite');
      const texture2 = await spriteManager.loadTexture('test_sprite');
      
      expect(texture1).toBe(texture2); // Same reference due to caching
    });
  });
});


