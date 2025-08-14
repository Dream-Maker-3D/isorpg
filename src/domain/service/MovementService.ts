/**
 * @pattern Facade
 * @description Movement service that integrates command system with player and map
 */

import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { InputManager } from '@patterns/behavioral/ChainOfResponsibility/InputHandler';
import { ICommand, CommandResult, MovementCommand } from '@patterns/behavioral/Command/MovementCommand';
import { EventBus } from '@gameKernel/Kernel';
import { AnimationService } from '@domain/service/AnimationService';

/**
 * @pattern Facade
 * @description Movement service providing simplified interface to movement system
 */
export class MovementService {
  private player: Player;
  private map: Map;
  private inputManager: InputManager;
  private eventBus: EventBus;
  private animationService: AnimationService;
  private isEnabled: boolean = true;

  constructor(player: Player, map: Map) {
    this.player = player;
    this.map = map;
    this.inputManager = new InputManager(player, map);
    this.eventBus = EventBus.getInstance();
    this.animationService = new AnimationService();
  }

  /**
   * @pattern Facade
   * @description Process keyboard input and execute movement
   */
  public handleInput(key: string): CommandResult | null {
    if (!this.isEnabled) {
      return null;
    }

    const command = this.inputManager.processInput(key);
    if (!command) {
      return null;
    }

    const result = this.executeCommand(command);
    this.emitMovementEvent(result);
    
    return result;
  }

  /**
   * @pattern Facade
   * @description Execute a movement command
   */
  public executeCommand(command: ICommand): CommandResult {
    if (command instanceof MovementCommand) {
      return command.getResult();
    } else {
      const success = command.execute();
      return {
        success,
        message: success ? 'Command executed' : 'Command failed',
        previousPosition: undefined
      };
    }
  }

  /**
   * @pattern Facade
   * @description Move player to specific position
   */
  public moveTo(x: number, y: number, z: number = 0): CommandResult {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Movement is disabled'
      };
    }

    // Validate position
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) {
      return {
        success: false,
        message: 'Position is outside map boundaries'
      };
    }

    if (!this.map.isWalkable(x, y)) {
      return {
        success: false,
        message: 'Position is not walkable'
      };
    }

    // Store previous position
    const previousPosition = {
      x: this.player.getX(),
      y: this.player.getY(),
      z: this.player.getZ()
    };

    // Calculate direction
    const deltaX = x - previousPosition.x;
    const deltaY = y - previousPosition.y;
    const direction = this.calculateDirection(deltaX, deltaY);

    // Move player
    this.player.setPosition(x, y, z);
    this.player.setDirection(direction);
    
    // Start walk animation
    this.animationService.startWalkAnimation(this.player, direction);

    const result: CommandResult = {
      success: true,
      message: `Moved to (${x}, ${y}, ${z})`,
      previousPosition
    };

    this.emitMovementEvent(result);
    return result;
  }

  /**
   * @pattern Facade
   * @description Get player's current position
   */
  public getPlayerPosition(): { x: number; y: number; z: number } {
    return {
      x: this.player.getX(),
      y: this.player.getY(),
      z: this.player.getZ()
    };
  }

  /**
   * @pattern Facade
   * @description Check if position is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    return this.map.isWalkable(x, y);
  }

  /**
   * @pattern Facade
   * @description Get movement cost for position
   */
  public getMovementCost(x: number, y: number): number {
    return this.map.getMovementCost(x, y);
  }

  /**
   * @pattern Facade
   * @description Enable or disable movement
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.inputManager.clearQueue();
      this.animationService.pauseAnimation(this.player);
    } else {
      this.animationService.resumeAnimation(this.player);
    }
  }

  /**
   * @pattern Facade
   * @description Check if movement is enabled
   */
  public isMovementEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * @pattern Facade
   * @description Get input queue status
   */
  public getQueueStatus(): { length: number; isProcessing: boolean } {
    return this.inputManager.getQueueStatus();
  }

  /**
   * @pattern Facade
   * @description Clear input queue
   */
  public clearQueue(): void {
    this.inputManager.clearQueue();
  }

  /**
   * @pattern Facade
   * @description Calculate direction from delta movement
   */
  private calculateDirection(deltaX: number, deltaY: number): 'north' | 'south' | 'east' | 'west' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'east' : 'west';
    } else {
      return deltaY > 0 ? 'south' : 'north';
    }
  }

  /**
   * @pattern Facade
   * @description Emit movement event to event bus
   */
  private emitMovementEvent(result: CommandResult): void {
    if (result.success) {
      this.eventBus.emit('player:moved', {
        player: this.player,
        position: this.getPlayerPosition(),
        previousPosition: result.previousPosition,
        direction: this.player.getCurrentDirection()
      });
    } else {
      this.eventBus.emit('player:movement_failed', {
        player: this.player,
        reason: result.message,
        position: this.getPlayerPosition()
      });
    }
  }

  /**
   * @pattern Facade
   * @description Get movement statistics
   */
  public getMovementStats(): {
    currentPosition: { x: number; y: number; z: number };
    walkableTiles: number;
    totalTiles: number;
    movementEnabled: boolean;
    animationStats: any;
  } {
    const walkablePositions = this.map.getWalkablePositions();
    
    return {
      currentPosition: this.getPlayerPosition(),
      walkableTiles: walkablePositions.length,
      totalTiles: this.map.width * this.map.height,
      movementEnabled: this.isEnabled,
      animationStats: this.animationService.getAnimationStats()
    };
  }
}
