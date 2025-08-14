/**
 * @pattern Abstract Factory
 * @description Factory abstraction for creating different types of tiles
 */

import { TileType } from '@domain/valueObject/TileType';
import { TileFlyweight, TileExtrinsicState } from '@patterns/structural/Flyweight/TileFlyweight';
import { TileFlyweightFactory } from '@patterns/structural/Flyweight/TileFlyweight';

/**
 * @pattern Abstract Factory
 * @description Abstract tile factory interface
 */
export interface ITileFactory {
  createTile(type: TileType, x: number, y: number, z?: number): TileInstance;
  createWalkableTile(x: number, y: number, z?: number): TileInstance;
  createWaterTile(x: number, y: number, z?: number): TileInstance;
  createMountainTile(x: number, y: number, z?: number): TileInstance;
}

/**
 * @pattern Product
 * @description Tile instance with flyweight and extrinsic state
 */
export class TileInstance {
  private readonly _flyweight: TileFlyweight;
  private readonly _extrinsicState: TileExtrinsicState;

  constructor(flyweight: TileFlyweight, extrinsicState: TileExtrinsicState) {
    this._flyweight = flyweight;
    this._extrinsicState = extrinsicState;
  }

  public get flyweight(): TileFlyweight {
    return this._flyweight;
  }

  public get extrinsicState(): TileExtrinsicState {
    return this._extrinsicState;
  }

  public get x(): number {
    return this._extrinsicState.x;
  }

  public get y(): number {
    return this._extrinsicState.y;
  }

  public get z(): number {
    return this._extrinsicState.z;
  }

  public get type(): TileType {
    return this._flyweight.type;
  }

  public isWalkable(): boolean {
    return this._flyweight.isWalkable();
  }

  public isSwimable(): boolean {
    return this._flyweight.isSwimable();
  }

  public getMovementCost(): number {
    return this._flyweight.getMovementCost();
  }

  public getElevation(): number {
    return this._flyweight.getElevation();
  }

  public getTextureKey(): string {
    return this._flyweight.getTextureKey();
  }

  public render(): void {
    this._flyweight.render(this._extrinsicState);
  }

  public toString(): string {
    return `TileInstance(${this.type} at ${this.x},${this.y},${this.z})`;
  }
}

/**
 * @pattern Concrete Factory
 * @description Standard tile factory implementation
 */
export class StandardTileFactory implements ITileFactory {
  /**
   * @pattern Abstract Factory
   * @description Create a tile of specified type
   */
  public createTile(type: TileType, x: number, y: number, z: number = 0): TileInstance {
    const flyweight = TileFlyweightFactory.getFlyweight(type);
    const extrinsicState: TileExtrinsicState = { x, y, z };
    return new TileInstance(flyweight, extrinsicState);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a walkable tile (randomly selects from walkable types)
   */
  public createWalkableTile(x: number, y: number, z: number = 0): TileInstance {
    const walkableTypes = [TileType.GRASS, TileType.PATH, TileType.STONE, TileType.SAND];
    const randomType = walkableTypes[Math.floor(Math.random() * walkableTypes.length)];
    return this.createTile(randomType, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a water tile
   */
  public createWaterTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.WATER, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a mountain tile
   */
  public createMountainTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.MOUNTAIN, x, y, z);
  }
}

/**
 * @pattern Concrete Factory
 * @description Forest-themed tile factory
 */
export class ForestTileFactory implements ITileFactory {
  /**
   * @pattern Abstract Factory
   * @description Create a tile with forest bias
   */
  public createTile(type: TileType, x: number, y: number, z: number = 0): TileInstance {
    const flyweight = TileFlyweightFactory.getFlyweight(type);
    const extrinsicState: TileExtrinsicState = { x, y, z };
    return new TileInstance(flyweight, extrinsicState);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a walkable tile with forest preference
   */
  public createWalkableTile(x: number, y: number, z: number = 0): TileInstance {
    const forestTypes = [TileType.FOREST, TileType.GRASS, TileType.PATH];
    const randomType = forestTypes[Math.floor(Math.random() * forestTypes.length)];
    return this.createTile(randomType, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a water tile
   */
  public createWaterTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.WATER, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a mountain tile
   */
  public createMountainTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.MOUNTAIN, x, y, z);
  }
}

/**
 * @pattern Concrete Factory
 * @description Desert-themed tile factory
 */
export class DesertTileFactory implements ITileFactory {
  /**
   * @pattern Abstract Factory
   * @description Create a tile with desert bias
   */
  public createTile(type: TileType, x: number, y: number, z: number = 0): TileInstance {
    const flyweight = TileFlyweightFactory.getFlyweight(type);
    const extrinsicState: TileExtrinsicState = { x, y, z };
    return new TileInstance(flyweight, extrinsicState);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a walkable tile with desert preference
   */
  public createWalkableTile(x: number, y: number, z: number = 0): TileInstance {
    const desertTypes = [TileType.SAND, TileType.STONE, TileType.PATH];
    const randomType = desertTypes[Math.floor(Math.random() * desertTypes.length)];
    return this.createTile(randomType, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a water tile (rare in desert)
   */
  public createWaterTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.WATER, x, y, z);
  }

  /**
   * @pattern Abstract Factory
   * @description Create a mountain tile
   */
  public createMountainTile(x: number, y: number, z: number = 0): TileInstance {
    return this.createTile(TileType.MOUNTAIN, x, y, z);
  }
}

/**
 * @pattern Factory Method
 * @description Factory for creating tile factories based on theme
 */
export class TileFactoryFactory {
  /**
   * @pattern Factory Method
   * @description Create factory based on theme
   */
  public static createFactory(theme: 'standard' | 'forest' | 'desert'): ITileFactory {
    switch (theme) {
      case 'forest':
        return new ForestTileFactory();
      case 'desert':
        return new DesertTileFactory();
      case 'standard':
      default:
        return new StandardTileFactory();
    }
  }
}

