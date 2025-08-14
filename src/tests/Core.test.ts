/**
 * @pattern Test
 * @description Core system tests to verify restored files
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, GameKernel, Entity, Component } from '@gameKernel/Kernel';
import { CharacterClass, CharacterClassFactory } from '@domain/valueObject/CharacterClass';
import { PlayerBuilder } from '@patterns/creational/Builder/PlayerBuilder';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';

describe('Core System Tests', () => {
  let eventBus: EventBus;
  let gameKernel: GameKernel;

  beforeEach(() => {
    // Reset singletons for each test
    (EventBus as any).instance = undefined;
    (GameKernel as any).instance = undefined;
    
    eventBus = EventBus.getInstance();
    gameKernel = GameKernel.getInstance();
  });

  describe('EventBus (Singleton + Observer)', () => {
    it('should maintain singleton instance', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should emit and receive events', () => {
      let receivedEvent = null;
      eventBus.on('test:event', (event) => {
        receivedEvent = event;
      });

      const testData = { message: 'Hello World' };
      eventBus.emit('test:event', testData);

      expect(receivedEvent).toEqual(testData);
    });
  });

  describe('GameKernel (Singleton)', () => {
    it('should maintain singleton instance', () => {
      const instance1 = GameKernel.getInstance();
      const instance2 = GameKernel.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize successfully', async () => {
      await expect(gameKernel.initialize()).resolves.not.toThrow();
    });

    it('should manage entities', () => {
      const entity = new Entity('test-entity');
      gameKernel.addEntity(entity);
      
      expect(gameKernel.getEntity('test-entity')).toBe(entity);
      expect(gameKernel.getAllEntities()).toHaveLength(1);
    });
  });

  describe('CharacterClass (Value Object)', () => {
    it('should create character classes with correct properties', () => {
      const wizard = CharacterClassFactory.fromType('WIZARD');
      
      expect(wizard.type).toBe('WIZARD');
      expect(wizard.name).toBe('Wizard');
      expect(wizard.baseHealth).toBe(80);
      expect(wizard.baseMana).toBe(120);
    });

    it('should provide all character classes', () => {
      const classes = CharacterClassFactory.getAllClasses();
      
      expect(classes).toHaveLength(4);
      expect(classes.map(c => c.type)).toContain('WIZARD');
      expect(classes.map(c => c.type)).toContain('WARRIOR');
      expect(classes.map(c => c.type)).toContain('ROGUE');
      expect(classes.map(c => c.type)).toContain('CLERIC');
    });
  });

  describe('PlayerBuilder (Builder Pattern)', () => {
    it('should create wizard player with builder', () => {
      const player = PlayerBuilder.createWizard('TestWizard');
      
      expect(player.name).toBe('TestWizard');
      expect(player.characterClass.type).toBe('WIZARD');
      expect(player.hasComponent('Position')).toBe(true);
      expect(player.hasComponent('Sprite')).toBe(true);
      expect(player.hasComponent('Inventory')).toBe(true);
      expect(player.hasComponent('Animation')).toBe(true);
    });

    it('should create custom player with fluent interface', () => {
      const characterClass = CharacterClassFactory.fromType('WARRIOR');
      const player = new PlayerBuilder()
        .setName('CustomWarrior')
        .setCharacterClass(characterClass)
        .setPosition(10, 15, 0)
        .setInventoryCapacity(20)
        .build();

      expect(player.name).toBe('CustomWarrior');
      expect(player.characterClass.type).toBe('WARRIOR');
      expect(player.getX()).toBe(10);
      expect(player.getY()).toBe(15);
    });
  });

  describe('ECS Components', () => {
    it('should create and manage position component', () => {
      const position = new PositionComponent(5, 10, 0);
      
      expect(position.x).toBe(5);
      expect(position.y).toBe(10);
      expect(position.z).toBe(0);
      
      position.move(2, -3, 1);
      expect(position.x).toBe(7);
      expect(position.y).toBe(7);
      expect(position.z).toBe(1);
    });

    it('should create and manage sprite component', () => {
      const sprite = new SpriteComponent('test_sprite', 0, 'idle');
      
      expect(sprite.textureKey).toBe('test_sprite');
      expect(sprite.frame).toBe(0);
      expect(sprite.animationState).toBe('idle');
      expect(sprite.visible).toBe(true);
      expect(sprite.alpha).toBe(1.0);
    });
  });

  describe('Entity Management', () => {
    it('should add and retrieve components', () => {
      const entity = new Entity('test-entity');
      const position = new PositionComponent(0, 0, 0);
      const sprite = new SpriteComponent('test_sprite');
      
      entity.addComponent(position);
      entity.addComponent(sprite);
      
      expect(entity.hasComponent('Position')).toBe(true);
      expect(entity.hasComponent('Sprite')).toBe(true);
      expect(entity.getComponent<PositionComponent>('Position')).toBe(position);
      expect(entity.getComponent<SpriteComponent>('Sprite')).toBe(sprite);
    });

    it('should get component types', () => {
      const entity = new Entity('test-entity');
      entity.addComponent(new PositionComponent());
      entity.addComponent(new SpriteComponent());
      
      const types = entity.getComponentTypes();
      expect(types).toContain('Position');
      expect(types).toContain('Sprite');
      expect(types).toHaveLength(2);
    });
  });
});

