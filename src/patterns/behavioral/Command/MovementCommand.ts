/**
 * @pattern Command
 * @description Movement command system for player navigation
 */

import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { Direction } from '@domain/entity/components/AnimationComponent';

/**
 * @pattern Command
 * @description Abstract command interface
 */
export interface ICommand {
  execute(): boolean;
  undo(): boolean;
  canExecute(): boolean;
}

/**
 * @pattern Command
 * @description Command result with success status and message
 */
export interface CommandResult {
  success: boolean;
  message: string;
  previousPosition?: { x: number; y: number; z: number };
}

/**
 * @pattern Command
 * @description Abstract movement command base class
 */
export abstract class MovementCommand implements ICommand {
  protected player: Player;
  protected map: Map;
  protected deltaX: number;
  protected deltaY: number;
  protected deltaZ: number;
  protected direction: Direction;
  protected previousPosition?: { x: number; y: number; z: number };

  constructor(
    player: Player,
    map: Map,
    deltaX: number,
    deltaY: number,
    deltaZ: number,
    direction: Direction
  ) {
    this.player = player;
    this.map = map;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.deltaZ = deltaZ;
    this.direction = direction;
  }

  /**
   * @pattern Command
   * @description Execute the movement command
   */
  public execute(): boolean {
    if (!this.canExecute()) {
      return false;
    }

    // Store previous position for undo
    this.previousPosition = {
      x: this.player.getX(),
      y: this.player.getY(),
      z: this.player.getZ()
    };

    // Calculate new position
    const newX = this.player.getX() + this.deltaX;
    const newY = this.player.getY() + this.deltaY;
    const newZ = this.player.getZ() + this.deltaZ;

    // Validate movement
    if (!this.isValidPosition(newX, newY, newZ)) {
      return false;
    }

    // Execute movement
    this.player.setPosition(newX, newY, newZ);
    this.player.setDirection(this.direction);
    this.player.setAnimationType('walk');

    return true;
  }

  /**
   * @pattern Command
   * @description Undo the movement command
   */
  public undo(): boolean {
    if (!this.previousPosition) {
      return false;
    }

    this.player.setPosition(
      this.previousPosition.x,
      this.previousPosition.y,
      this.previousPosition.z
    );
    this.player.setAnimationType('idle');

    return true;
  }

  /**
   * @pattern Command
   * @description Check if command can be executed
   */
  public canExecute(): boolean {
    const newX = this.player.getX() + this.deltaX;
    const newY = this.player.getY() + this.deltaY;
    const newZ = this.player.getZ() + this.deltaZ;

    return this.isValidPosition(newX, newY, newZ);
  }

  /**
   * @pattern Command
   * @description Validate if position is valid for movement
   */
  protected isValidPosition(x: number, y: number, z: number): boolean {
    // Check map boundaries
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) {
      return false;
    }

    // Check if tile is walkable
    if (!this.map.isWalkable(x, y)) {
      return false;
    }

    // Check elevation differences (can't jump too high)
    const currentElevation = this.map.getElevation(this.player.getX(), this.player.getY());
    const targetElevation = this.map.getElevation(x, y);
    const elevationDiff = Math.abs(targetElevation - currentElevation);

    if (elevationDiff > 1) {
      return false;
    }

    return true;
  }

  /**
   * @pattern Command
   * @description Get command result with details
   */
  public getResult(): CommandResult {
    const success = this.execute();
    return {
      success,
      message: success ? `Moved ${this.direction}` : `Cannot move ${this.direction}`,
      previousPosition: this.previousPosition
    };
  }

  public toString(): string {
    return `MovementCommand(${this.direction}, ${this.deltaX},${this.deltaY},${this.deltaZ})`;
  }
}

/**
 * @pattern Concrete Command
 * @description Move north command
 */
export class MoveNorthCommand extends MovementCommand {
  constructor(player: Player, map: Map) {
    super(player, map, 0, -1, 0, 'north');
  }
}

/**
 * @pattern Concrete Command
 * @description Move south command
 */
export class MoveSouthCommand extends MovementCommand {
  constructor(player: Player, map: Map) {
    super(player, map, 0, 1, 0, 'south');
  }
}

/**
 * @pattern Concrete Command
 * @description Move east command
 */
export class MoveEastCommand extends MovementCommand {
  constructor(player: Player, map: Map) {
    super(player, map, 1, 0, 0, 'east');
  }
}

/**
 * @pattern Concrete Command
 * @description Move west command
 */
export class MoveWestCommand extends MovementCommand {
  constructor(player: Player, map: Map) {
    super(player, map, -1, 0, 0, 'west');
  }
}

/**
 * @pattern Concrete Command
 * @description No movement command (idle)
 */
export class NoMovementCommand extends MovementCommand {
  constructor(player: Player, map: Map) {
    super(player, map, 0, 0, 0, 'south');
  }

  public execute(): boolean {
    this.player.setAnimationType('idle');
    return true;
  }

  public canExecute(): boolean {
    return true;
  }
}


