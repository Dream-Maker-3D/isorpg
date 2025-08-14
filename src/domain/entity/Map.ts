/**
 * @pattern Facade
 * @description Main map class that integrates all tile and map patterns
 */

import { ITileFactory, TileInstance, TileFactoryFactory } from '@patterns/creational/AbstractFactory/TileFactory';
import { MapComposite, MapLayer, MapRegion, TileComponent } from '@patterns/structural/Composite/MapComposite';
import { TileFlyweightFactory } from '@patterns/structural/Flyweight/TileFlyweight';
import { TileType } from '@domain/valueObject/TileType';

/**
 * @pattern Facade
 * @description Main map class providing simplified interface to complex tile system
 */
export class Map extends MapComposite {
  private _tileFactory: ITileFactory;
  private _regions: MapRegion[] = [];
  private _layers: MapLayer[] = [];

  constructor(
    name: string,
    width: number,
    height: number,
    theme: 'standard' | 'forest' | 'desert' = 'standard'
  ) {
    super(name, 0, 0, width, height);
    this._tileFactory = TileFactoryFactory.createFactory(theme);
    
    // Preload all tile flyweights
    TileFlyweightFactory.preloadAll();
  }

  /**
   * @pattern Facade
   * @description Create a new map layer
   */
  public createLayer(name: string, layerId: number): MapLayer {
    const layer = new MapLayer(name, layerId, 0, 0, this.width, this.height);
    this._layers.push(layer);
    this.add(layer);
    return layer;
  }

  /**
   * @pattern Facade
   * @description Create a new map region
   */
  public createRegion(name: string, regionType: string, x: number, y: number, width: number, height: number): MapRegion {
    const region = new MapRegion(name, regionType, x, y, width, height);
    this._regions.push(region);
    this.add(region);
    return region;
  }

  /**
   * @pattern Facade
   * @description Generate a random map
   */
  public generateRandomMap(): void {
    // Create base layer
    const baseLayer = this.createLayer('base', 0);
    
    // Generate random tiles
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const tile = this._tileFactory.createWalkableTile(x, y);
        const tileComponent = new TileComponent(tile);
        baseLayer.add(tileComponent);
      }
    }

    // Add some water features
    this.addWaterFeatures(baseLayer);
    
    // Add some mountain features
    this.addMountainFeatures(baseLayer);
  }

  /**
   * @pattern Facade
   * @description Add water features to the map
   */
  private addWaterFeatures(layer: MapLayer): void {
    const waterCount = Math.floor((this.width * this.height) * 0.1); // 10% water
    
    for (let i = 0; i < waterCount; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      
      const waterTile = this._tileFactory.createWaterTile(x, y);
      const tileComponent = new TileComponent(waterTile);
      layer.add(tileComponent);
    }
  }

  /**
   * @pattern Facade
   * @description Add mountain features to the map
   */
  private addMountainFeatures(layer: MapLayer): void {
    const mountainCount = Math.floor((this.width * this.height) * 0.05); // 5% mountains
    
    for (let i = 0; i < mountainCount; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      
      const mountainTile = this._tileFactory.createMountainTile(x, y);
      const tileComponent = new TileComponent(mountainTile);
      layer.add(tileComponent);
    }
  }

  /**
   * @pattern Facade
   * @description Check if a position is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? tile.isWalkable() : false;
  }

  /**
   * @pattern Facade
   * @description Check if a position is swimable
   */
  public isSwimable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? tile.isSwimable() : false;
  }

  /**
   * @pattern Facade
   * @description Get movement cost for a position
   */
  public getMovementCost(x: number, y: number): number {
    const tile = this.getTile(x, y);
    return tile ? tile.getMovementCost() : 1;
  }

  /**
   * @pattern Facade
   * @description Get elevation for a position
   */
  public getElevation(x: number, y: number): number {
    const tile = this.getTile(x, y);
    return tile ? tile.getElevation() : 0;
  }

  /**
   * @pattern Facade
   * @description Set a specific tile at position
   */
  public setTileAt(x: number, y: number, type: TileType): boolean {
    const tile = this._tileFactory.createTile(type, x, y);
    return this.setTile(x, y, tile);
  }

  /**
   * @pattern Facade
   * @description Get all walkable positions
   */
  public getWalkablePositions(): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.isWalkable(x, y)) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * @pattern Facade
   * @description Get random walkable position
   */
  public getRandomWalkablePosition(): { x: number; y: number } | null {
    const walkablePositions = this.getWalkablePositions();
    if (walkablePositions.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * walkablePositions.length);
    return walkablePositions[randomIndex];
  }

  /**
   * @pattern Facade
   * @description Get map statistics
   */
  public getMapStats(): {
    totalTiles: number;
    walkableTiles: number;
    waterTiles: number;
    mountainTiles: number;
    flyweightCount: number;
  } {
    const walkableTiles = this.getWalkablePositions().length;
    const waterTiles = this.getTilesByType(TileType.WATER).length;
    const mountainTiles = this.getTilesByType(TileType.MOUNTAIN).length;
    
    return {
      totalTiles: this.width * this.height,
      walkableTiles,
      waterTiles,
      mountainTiles,
      flyweightCount: TileFlyweightFactory.getFlyweightCount()
    };
  }

  /**
   * @pattern Facade
   * @description Render the entire map
   */
  public render(): void {
    console.log(`Rendering map: ${this.name} (${this.width}x${this.height})`);
    super.render();
  }

  public toString(): string {
    const stats = this.getMapStats();
    return `Map(${this.name}, ${this.width}x${this.height}, ${stats.walkableTiles}/${stats.totalTiles} walkable)`;
  }
}


