/**
 * @pattern Chain of Responsibility
 * @description Input handling chain for keyboard events and movement commands
 */

import { ICommand, MovementCommand, CommandResult } from '@patterns/behavioral/Command/MovementCommand';
import { Player } from '@domain/entity/Player';
import { Map } from '@domain/entity/Map';
import { MoveNorthCommand, MoveSouthCommand, MoveEastCommand, MoveWestCommand, NoMovementCommand } from '@patterns/behavioral/Command/MovementCommand';

/**
 * @pattern Chain of Responsibility
 * @description Abstract handler in the chain
 */
export abstract class InputHandler {
  protected nextHandler: InputHandler | null = null;
  protected player: Player;
  protected map: Map;

  constructor(player: Player, map: Map) {
    this.player = player;
    this.map = map;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Set the next handler in the chain
   */
  public setNext(handler: InputHandler): InputHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Handle input event
   */
  public handle(key: string): ICommand | null {
    const command = this.processInput(key);
    
    if (command) {
      return command;
    }
    
    // Pass to next handler in chain
    if (this.nextHandler) {
      return this.nextHandler.handle(key);
    }
    
    return null;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Abstract method for processing input
   */
  protected abstract processInput(key: string): ICommand | null;
}

/**
 * @pattern Concrete Handler
 * @description Handles movement keys (WASD)
 */
export class MovementInputHandler extends InputHandler {
  private readonly movementKeys: Map<string, () => ICommand> = new Map();

  constructor(player: Player, map: Map) {
    super(player, map);
    this.initializeMovementKeys();
  }

  /**
   * @pattern Chain of Responsibility
   * @description Initialize movement key mappings
   */
  private initializeMovementKeys(): void {
    this.movementKeys.set('w', () => new MoveNorthCommand(this.player, this.map));
    this.movementKeys.set('a', () => new MoveWestCommand(this.player, this.map));
    this.movementKeys.set('s', () => new MoveSouthCommand(this.player, this.map));
    this.movementKeys.set('d', () => new MoveEastCommand(this.player, this.map));
    
    // Arrow keys
    this.movementKeys.set('ArrowUp', () => new MoveNorthCommand(this.player, this.map));
    this.movementKeys.set('ArrowLeft', () => new MoveWestCommand(this.player, this.map));
    this.movementKeys.set('ArrowDown', () => new MoveSouthCommand(this.player, this.map));
    this.movementKeys.set('ArrowRight', () => new MoveEastCommand(this.player, this.map));
  }

  /**
   * @pattern Chain of Responsibility
   * @description Process movement input
   */
  protected processInput(key: string): ICommand | null {
    const keyLower = key.toLowerCase();
    
    if (this.movementKeys.has(keyLower) || this.movementKeys.has(key)) {
      const commandFactory = this.movementKeys.get(keyLower) || this.movementKeys.get(key);
      return commandFactory ? commandFactory() : null;
    }
    
    return null;
  }
}

/**
 * @pattern Concrete Handler
 * @description Handles action keys (Space, Enter, etc.)
 */
export class ActionInputHandler extends InputHandler {
  private readonly actionKeys: Map<string, () => ICommand> = new Map();

  constructor(player: Player, map: Map) {
    super(player, map);
    this.initializeActionKeys();
  }

  /**
   * @pattern Chain of Responsibility
   * @description Initialize action key mappings
   */
  private initializeActionKeys(): void {
    this.actionKeys.set(' ', () => new NoMovementCommand(this.player, this.map)); // Space for idle
    this.actionKeys.set('Enter', () => new NoMovementCommand(this.player, this.map)); // Enter for idle
  }

  /**
   * @pattern Chain of Responsibility
   * @description Process action input
   */
  protected processInput(key: string): ICommand | null {
    if (this.actionKeys.has(key)) {
      const commandFactory = this.actionKeys.get(key);
      return commandFactory ? commandFactory() : null;
    }
    
    return null;
  }
}

/**
 * @pattern Concrete Handler
 * @description Handles system keys (Escape, etc.)
 */
export class SystemInputHandler extends InputHandler {
  private readonly systemKeys: Map<string, () => ICommand> = new Map();

  constructor(player: Player, map: Map) {
    super(player, map);
    this.initializeSystemKeys();
  }

  /**
   * @pattern Chain of Responsibility
   * @description Initialize system key mappings
   */
  private initializeSystemKeys(): void {
    this.systemKeys.set('Escape', () => new NoMovementCommand(this.player, this.map));
    this.systemKeys.set('Tab', () => new NoMovementCommand(this.player, this.map));
  }

  /**
   * @pattern Chain of Responsibility
   * @description Process system input
   */
  protected processInput(key: string): ICommand | null {
    if (this.systemKeys.has(key)) {
      const commandFactory = this.systemKeys.get(key);
      return commandFactory ? commandFactory() : null;
    }
    
    return null;
  }
}

/**
 * @pattern Chain of Responsibility
 * @description Input manager that orchestrates the handler chain
 */
export class InputManager {
  private handlerChain: InputHandler;
  private commandQueue: ICommand[] = [];
  private isProcessing: boolean = false;

  constructor(player: Player, map: Map) {
    // Build the handler chain
    const movementHandler = new MovementInputHandler(player, map);
    const actionHandler = new ActionInputHandler(player, map);
    const systemHandler = new SystemInputHandler(player, map);

    // Chain: Movement -> Action -> System
    movementHandler.setNext(actionHandler).setNext(systemHandler);
    this.handlerChain = movementHandler;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Process keyboard input
   */
  public processInput(key: string): ICommand | null {
    const command = this.handlerChain.handle(key);
    
    if (command) {
      this.commandQueue.push(command);
      return command;
    }
    
    return null;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Execute all queued commands
   */
  public executeCommands(): CommandResult[] {
    if (this.isProcessing) {
      return [];
    }

    this.isProcessing = true;
    const results: CommandResult[] = [];

    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        const result = this.executeCommand(command);
        results.push(result);
      }
    }

    this.isProcessing = false;
    return results;
  }

  /**
   * @pattern Chain of Responsibility
   * @description Execute a single command
   */
  private executeCommand(command: ICommand): CommandResult {
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
   * @pattern Chain of Responsibility
   * @description Clear command queue
   */
  public clearQueue(): void {
    this.commandQueue = [];
  }

  /**
   * @pattern Chain of Responsibility
   * @description Get queue status
   */
  public getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.commandQueue.length,
      isProcessing: this.isProcessing
    };
  }
}


