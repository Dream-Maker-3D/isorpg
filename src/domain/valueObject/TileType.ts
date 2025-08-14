/**
 * @pattern Value Object
 * @description Tile types and properties for isometric map
 */

/**
 * @pattern Value Object
 * @description Tile type enum for different terrain types
 */
export enum TileType {
  GRASS = 'grass',
  STONE = 'stone',
  WATER = 'water',
  SAND = 'sand',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  PATH = 'path',
  BRIDGE = 'bridge'
}

/**
 * @pattern Value Object
 * @description Tile properties interface
 */
export interface TileProperties {
  readonly type: TileType;
  readonly walkable: boolean;
  readonly swimable: boolean;
  readonly flyable: boolean;
  readonly textureKey: string;
  readonly movementCost: number;
  readonly elevation: number;
  readonly description: string;
}

/**
 * @pattern Value Object
 * @description Immutable tile properties for each tile type
 */
export class TilePropertiesFactory {
  private static readonly properties: Map<TileType, TileProperties> = new Map([
    [TileType.GRASS, {
      type: TileType.GRASS,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_grass',
      movementCost: 1,
      elevation: 0,
      description: 'Lush green grass'
    }],
    [TileType.STONE, {
      type: TileType.STONE,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_stone',
      movementCost: 2,
      elevation: 0,
      description: 'Solid stone ground'
    }],
    [TileType.WATER, {
      type: TileType.WATER,
      walkable: false,
      swimable: true,
      flyable: true,
      textureKey: 'tile_water',
      movementCost: 3,
      elevation: -1,
      description: 'Clear flowing water'
    }],
    [TileType.SAND, {
      type: TileType.SAND,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_sand',
      movementCost: 2,
      elevation: 0,
      description: 'Warm desert sand'
    }],
    [TileType.FOREST, {
      type: TileType.FOREST,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_forest',
      movementCost: 3,
      elevation: 1,
      description: 'Dense forest canopy'
    }],
    [TileType.MOUNTAIN, {
      type: TileType.MOUNTAIN,
      walkable: false,
      swimable: false,
      flyable: true,
      textureKey: 'tile_mountain',
      movementCost: 5,
      elevation: 3,
      description: 'Steep mountain peak'
    }],
    [TileType.PATH, {
      type: TileType.PATH,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_path',
      movementCost: 1,
      elevation: 0,
      description: 'Well-traveled path'
    }],
    [TileType.BRIDGE, {
      type: TileType.BRIDGE,
      walkable: true,
      swimable: false,
      flyable: true,
      textureKey: 'tile_bridge',
      movementCost: 1,
      elevation: 0,
      description: 'Stone bridge over water'
    }]
  ]);

  /**
   * @pattern Factory Method
   * @description Get tile properties by type
   */
  public static getProperties(type: TileType): TileProperties {
    const properties = this.properties.get(type);
    if (!properties) {
      throw new Error(`Unknown tile type: ${type}`);
    }
    return properties;
  }

  /**
   * @pattern Factory Method
   * @description Get all available tile types
   */
  public static getAllTypes(): readonly TileType[] {
    return Object.values(TileType);
  }

  /**
   * @pattern Factory Method
   * @description Get all tile properties
   */
  public static getAllProperties(): readonly TileProperties[] {
    return Array.from(this.properties.values());
  }

  /**
   * @pattern Factory Method
   * @description Get walkable tile types
   */
  public static getWalkableTypes(): readonly TileType[] {
    return this.getAllProperties()
      .filter(props => props.walkable)
      .map(props => props.type);
  }

  /**
   * @pattern Factory Method
   * @description Get swimable tile types
   */
  public static getSwimableTypes(): readonly TileType[] {
    return this.getAllProperties()
      .filter(props => props.swimable)
      .map(props => props.type);
  }
}

