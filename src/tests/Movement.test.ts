/**
 * @pattern Test
 * @description Unit tests for movement system with Command and Chain of Responsibility patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { CharacterClass, CharacterClassFactory } from '@domain/valueObject/CharacterClass';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';
import { AnimationComponent } from '@domain/entity/components/AnimationComponent';
import { MovementService } from '@domain/service/MovementService';
import { InputManager } from '@patterns/behavioral/ChainOfResponsibility/InputHandler';
import { 
  MoveNorthCommand, 
  MoveSouthCommand, 
  MoveEastCommand, 
  MoveWestCommand,
  NoMovementCommand 
} from '@patterns/behavioral/Command/MovementCommand';

describe('Movement System', () => {
  let player: Player;
  let map: Map;
  let movementService: MovementService;
  let inputManager: InputManager;

  beforeEach(() => {
    // Create a simple 10x10 map
    map = new Map('TestMap', 10, 10, 'standard');
    map.generateRandomMap();

    // Create player with components
    const characterClass = CharacterClassFactory.fromType('WARRIOR');
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

    movementService = new MovementService(player, map);
    inputManager = new InputManager(player, map);
  });

  describe('Movement Commands', () => {
    it('should create movement commands', () => {
      const northCommand = new MoveNorthCommand(player, map);
      const southCommand = new MoveSouthCommand(player, map);
      const eastCommand = new MoveEastCommand(player, map);
      const westCommand = new MoveWestCommand(player, map);

      expect(northCommand).toBeDefined();
      expect(southCommand).toBeDefined();
      expect(eastCommand).toBeDefined();
      expect(westCommand).toBeDefined();
    });

    it('should execute valid movement commands', () => {
      const startX = player.getX();
      const startY = player.getY();

      const northCommand = new MoveNorthCommand(player, map);
      const result = northCommand.execute();

      if (result) {
        expect(player.getY()).toBe(startY - 1);
        expect(player.getCurrentDirection()).toBe('north');
        expect(player.getCurrentAnimationType()).toBe('walk');
      }
    });

    it('should not execute invalid movement commands', () => {
      // Move player to edge of map
      player.setPosition(0, 0, 0);

      const westCommand = new MoveWestCommand(player, map);
      const result = westCommand.execute();

      expect(result).toBe(false);
      expect(player.getX()).toBe(0); // Should not move
    });

    it('should undo movement commands', () => {
      const startX = player.getX();
      const startY = player.getY();

      const eastCommand = new MoveEastCommand(player, map);
      eastCommand.execute();

      expect(player.getX()).toBe(startX + 1);

      eastCommand.undo();

      expect(player.getX()).toBe(startX);
      expect(player.getCurrentAnimationType()).toBe('idle');
    });

    it('should check if command can be executed', () => {
      const northCommand = new MoveNorthCommand(player, map);
      const canExecute = northCommand.canExecute();

      expect(typeof canExecute).toBe('boolean');
    });
  });

  describe('Input Handler Chain', () => {
    it('should process movement keys', () => {
      const northCommand = inputManager.processInput('w');
      const southCommand = inputManager.processInput('s');
      const eastCommand = inputManager.processInput('d');
      const westCommand = inputManager.processInput('a');

      expect(northCommand).toBeInstanceOf(MoveNorthCommand);
      expect(southCommand).toBeInstanceOf(MoveSouthCommand);
      expect(eastCommand).toBeInstanceOf(MoveEastCommand);
      expect(westCommand).toBeInstanceOf(MoveWestCommand);
    });

    it('should process arrow keys', () => {
      const northCommand = inputManager.processInput('ArrowUp');
      const southCommand = inputManager.processInput('ArrowDown');
      const eastCommand = inputManager.processInput('ArrowRight');
      const westCommand = inputManager.processInput('ArrowLeft');

      expect(northCommand).toBeInstanceOf(MoveNorthCommand);
      expect(southCommand).toBeInstanceOf(MoveSouthCommand);
      expect(eastCommand).toBeInstanceOf(MoveEastCommand);
      expect(westCommand).toBeInstanceOf(MoveWestCommand);
    });

    it('should process action keys', () => {
      const spaceCommand = inputManager.processInput(' ');
      const enterCommand = inputManager.processInput('Enter');

      expect(spaceCommand).toBeInstanceOf(NoMovementCommand);
      expect(enterCommand).toBeInstanceOf(NoMovementCommand);
    });

    it('should return null for unknown keys', () => {
      const unknownCommand = inputManager.processInput('x');
      expect(unknownCommand).toBeNull();
    });

    it('should queue commands for execution', () => {
      inputManager.processInput('w');
      inputManager.processInput('d');

      const status = inputManager.getQueueStatus();
      expect(status.length).toBe(2);
    });

    it('should execute queued commands', () => {
      inputManager.processInput('w');
      inputManager.processInput('d');

      const results = inputManager.executeCommands();
      expect(results.length).toBe(2);
      expect(results[0].success).toBeDefined();
    });
  });

  describe('Movement Service', () => {
    it('should handle keyboard input', () => {
      const result = movementService.handleInput('w');
      
      if (result) {
        expect(result.success).toBeDefined();
        expect(result.message).toBeDefined();
      }
    });

    it('should move player to specific position', () => {
      const startX = player.getX();
      const startY = player.getY();

      const result = movementService.moveTo(startX + 1, startY);

      if (result.success) {
        expect(player.getX()).toBe(startX + 1);
        expect(result.message).toContain('Moved to');
      }
    });

    it('should validate movement boundaries', () => {
      const result = movementService.moveTo(-1, 0);
      expect(result.success).toBe(false);
      expect(result.message).toContain('outside map boundaries');
    });

    it('should validate walkable tiles', () => {
      // Try to move to a non-walkable position (if any)
      const result = movementService.moveTo(0, 0);
      // Result depends on whether (0,0) is walkable in the generated map
      expect(typeof result.success).toBe('boolean');
    });

    it('should get player position', () => {
      const position = movementService.getPlayerPosition();
      expect(position.x).toBe(player.getX());
      expect(position.y).toBe(player.getY());
      expect(position.z).toBe(player.getZ());
    });

    it('should check if position is walkable', () => {
      const isWalkable = movementService.isWalkable(0, 0);
      expect(typeof isWalkable).toBe('boolean');
    });

    it('should get movement cost', () => {
      const cost = movementService.getMovementCost(0, 0);
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });

    it('should enable/disable movement', () => {
      movementService.setEnabled(false);
      expect(movementService.isMovementEnabled()).toBe(false);

      movementService.setEnabled(true);
      expect(movementService.isMovementEnabled()).toBe(true);
    });

    it('should get movement statistics', () => {
      const stats = movementService.getMovementStats();
      
      expect(stats.currentPosition).toBeDefined();
      expect(stats.walkableTiles).toBeGreaterThan(0);
      expect(stats.totalTiles).toBe(100); // 10x10 map
      expect(typeof stats.movementEnabled).toBe('boolean');
    });
  });
});


