/**
 * @pattern Flyweight
 * @description Memory-efficient tile instances with shared intrinsic state
 */

import { TileType, TileProperties, TilePropertiesFactory } from '@domain/valueObject/TileType';

/**
 * @pattern Flyweight
 * @description Intrinsic state shared across all tile instances of the same type
 */
export interface TileIntrinsicState {
  readonly type: TileType;
  readonly properties: TileProperties;
}

/**
 * @pattern Flyweight
 * @description Extrinsic state unique to each tile instance
 */
export interface TileExtrinsicState {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly variant?: number; // For tile variations
}

/**
 * @pattern Flyweight
 * @description Flyweight tile with shared intrinsic state
 */
export class TileFlyweight {
  private readonly _intrinsicState: TileIntrinsicState;

  constructor(type: TileType) {
    this._intrinsicState = {
      type,
      properties: TilePropertiesFactory.getProperties(type)
    };
  }

  public get intrinsicState(): TileIntrinsicState {
    return this._intrinsicState;
  }

  public get type(): TileType {
    return this._intrinsicState.type;
  }

  public get properties(): TileProperties {
    return this._intrinsicState.properties;
  }

  /**
   * @pattern Flyweight
   * @description Render tile with extrinsic state
   */
  public render(extrinsicState: TileExtrinsicState): void {
    // In a real implementation, this would render the tile
    // For now, we just log the rendering operation
    console.log(`Rendering ${this.type} at (${extrinsicState.x}, ${extrinsicState.y}, ${extrinsicState.z})`);
  }

  /**
   * @pattern Flyweight
   * @description Check if tile is walkable
   */
  public isWalkable(): boolean {
    return this.properties.walkable;
  }

  /**
   * @pattern Flyweight
   * @description Check if tile is swimable
   */
  public isSwimable(): boolean {
    return this.properties.swimable;
  }

  /**
   * @pattern Flyweight
   * @description Get movement cost for this tile
   */
  public getMovementCost(): number {
    return this.properties.movementCost;
  }

  /**
   * @pattern Flyweight
   * @description Get elevation of this tile
   */
  public getElevation(): number {
    return this.properties.elevation;
  }

  /**
   * @pattern Flyweight
   * @description Get texture key for this tile
   */
  public getTextureKey(): string {
    return this.properties.textureKey;
  }

  public toString(): string {
    return `TileFlyweight(${this.type})`;
  }
}

/**
 * @pattern Flyweight Factory
 * @description Manages flyweight tile instances
 */
export class TileFlyweightFactory {
  private static readonly flyweights: Map<TileType, TileFlyweight> = new Map();

  /**
   * @pattern Flyweight Factory
   * @description Get or create flyweight for tile type
   */
  public static getFlyweight(type: TileType): TileFlyweight {
    if (!this.flyweights.has(type)) {
      this.flyweights.set(type, new TileFlyweight(type));
    }
    return this.flyweights.get(type)!;
  }

  /**
   * @pattern Flyweight Factory
   * @description Get all flyweights
   */
  public static getAllFlyweights(): readonly TileFlyweight[] {
    return Array.from(this.flyweights.values());
  }

  /**
   * @pattern Flyweight Factory
   * @description Get flyweight count (for debugging)
   */
  public static getFlyweightCount(): number {
    return this.flyweights.size;
  }

  /**
   * @pattern Flyweight Factory
   * @description Clear all flyweights (for testing)
   */
  public static clear(): void {
    this.flyweights.clear();
  }

  /**
   * @pattern Flyweight Factory
   * @description Preload all tile types
   */
  public static preloadAll(): void {
    const allTypes = TilePropertiesFactory.getAllTypes();
    allTypes.forEach(type => this.getFlyweight(type));
  }
}


