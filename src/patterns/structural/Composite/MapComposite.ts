/**
 * @pattern Composite
 * @description Hierarchical map structure with tiles, regions, and layers
 */

import { TileInstance } from '@patterns/creational/AbstractFactory/TileFactory';
import { TileType } from '@domain/valueObject/TileType';

/**
 * @pattern Component
 * @description Abstract component for map hierarchy
 */
export abstract class MapComponent {
  protected _name: string;
  protected _x: number;
  protected _y: number;
  protected _width: number;
  protected _height: number;

  constructor(name: string, x: number, y: number, width: number, height: number) {
    this._name = name;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  public get name(): string {
    return this._name;
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get bounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height
    };
  }

  /**
   * @pattern Component
   * @description Check if coordinates are within bounds
   */
  public isWithinBounds(x: number, y: number): boolean {
    return x >= this._x && x < this._x + this._width &&
           y >= this._y && y < this._y + this._height;
  }

  /**
   * @pattern Component
   * @description Abstract render method
   */
  public abstract render(): void;

  /**
   * @pattern Component
   * @description Abstract get tile method
   */
  public abstract getTile(x: number, y: number): TileInstance | null;

  /**
   * @pattern Component
   * @description Abstract set tile method
   */
  public abstract setTile(x: number, y: number, tile: TileInstance): boolean;

  /**
   * @pattern Component
   * @description Abstract get tiles in area method
   */
  public abstract getTilesInArea(x: number, y: number, width: number, height: number): TileInstance[];

  public toString(): string {
    return `${this.constructor.name}(${this._name})`;
  }
}

/**
 * @pattern Leaf
 * @description Individual tile component
 */
export class TileComponent extends MapComponent {
  private _tile: TileInstance;

  constructor(tile: TileInstance) {
    super(`tile_${tile.x}_${tile.y}`, tile.x, tile.y, 1, 1);
    this._tile = tile;
  }

  public get tile(): TileInstance {
    return this._tile;
  }

  public render(): void {
    this._tile.render();
  }

  public getTile(x: number, y: number): TileInstance | null {
    if (this.isWithinBounds(x, y)) {
      return this._tile;
    }
    return null;
  }

  public setTile(x: number, y: number, tile: TileInstance): boolean {
    if (this.isWithinBounds(x, y)) {
      this._tile = tile;
      return true;
    }
    return false;
  }

  public getTilesInArea(x: number, y: number, width: number, height: number): TileInstance[] {
    if (this.isWithinBounds(x, y)) {
      return [this._tile];
    }
    return [];
  }

  public isWalkable(): boolean {
    return this._tile.isWalkable();
  }

  public isSwimable(): boolean {
    return this._tile.isSwimable();
  }

  public getMovementCost(): number {
    return this._tile.getMovementCost();
  }

  public getElevation(): number {
    return this._tile.getElevation();
  }
}

/**
 * @pattern Composite
 * @description Composite component that can contain other components
 */
export class MapComposite extends MapComponent {
  private _children: MapComponent[] = [];

  constructor(name: string, x: number, y: number, width: number, height: number) {
    super(name, x, y, width, height);
  }

  /**
   * @pattern Composite
   * @description Add child component
   */
  public add(child: MapComponent): void {
    this._children.push(child);
  }

  /**
   * @pattern Composite
   * @description Remove child component
   */
  public remove(child: MapComponent): boolean {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * @pattern Composite
   * @description Get child component by index
   */
  public getChild(index: number): MapComponent | null {
    return this._children[index] || null;
  }

  /**
   * @pattern Composite
   * @description Get all children
   */
  public getChildren(): readonly MapComponent[] {
    return this._children;
  }

  /**
   * @pattern Composite
   * @description Get child count
   */
  public getChildCount(): number {
    return this._children.length;
  }

  public render(): void {
    this._children.forEach(child => child.render());
  }

  public getTile(x: number, y: number): TileInstance | null {
    if (!this.isWithinBounds(x, y)) {
      return null;
    }

    for (const child of this._children) {
      const tile = child.getTile(x, y);
      if (tile) {
        return tile;
      }
    }
    return null;
  }

  public setTile(x: number, y: number, tile: TileInstance): boolean {
    if (!this.isWithinBounds(x, y)) {
      return false;
    }

    for (const child of this._children) {
      if (child.setTile(x, y, tile)) {
        return true;
      }
    }
    return false;
  }

  public getTilesInArea(x: number, y: number, width: number, height: number): TileInstance[] {
    const tiles: TileInstance[] = [];
    
    for (const child of this._children) {
      tiles.push(...child.getTilesInArea(x, y, width, height));
    }
    
    return tiles;
  }

  /**
   * @pattern Composite
   * @description Find path between two points
   */
  public findPath(startX: number, startY: number, endX: number, endY: number): TileInstance[] {
    // Simple pathfinding implementation
    const path: TileInstance[] = [];
    let currentX = startX;
    let currentY = startY;

    while (currentX !== endX || currentY !== endY) {
      const tile = this.getTile(currentX, currentY);
      if (tile) {
        path.push(tile);
      }

      // Move towards target
      if (currentX < endX) currentX++;
      else if (currentX > endX) currentX--;
      
      if (currentY < endY) currentY++;
      else if (currentY > endY) currentY--;
    }

    // Add final tile
    const finalTile = this.getTile(endX, endY);
    if (finalTile) {
      path.push(finalTile);
    }

    return path;
  }

  /**
   * @pattern Composite
   * @description Get all walkable tiles
   */
  public getWalkableTiles(): TileInstance[] {
    const walkableTiles: TileInstance[] = [];
    
    for (let x = this._x; x < this._x + this._width; x++) {
      for (let y = this._y; y < this._y + this._height; y++) {
        const tile = this.getTile(x, y);
        if (tile && tile.isWalkable()) {
          walkableTiles.push(tile);
        }
      }
    }
    
    return walkableTiles;
  }

  /**
   * @pattern Composite
   * @description Get tiles by type
   */
  public getTilesByType(type: TileType): TileInstance[] {
    const tiles: TileInstance[] = [];
    
    for (let x = this._x; x < this._x + this._width; x++) {
      for (let y = this._y; y < this._y + this._height; y++) {
        const tile = this.getTile(x, y);
        if (tile && tile.type === type) {
          tiles.push(tile);
        }
      }
    }
    
    return tiles;
  }
}

/**
 * @pattern Composite
 * @description Map layer containing tiles
 */
export class MapLayer extends MapComposite {
  private _layerId: number;
  private _isVisible: boolean = true;

  constructor(name: string, layerId: number, x: number, y: number, width: number, height: number) {
    super(name, x, y, width, height);
    this._layerId = layerId;
  }

  public get layerId(): number {
    return this._layerId;
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  public setVisible(visible: boolean): void {
    this._isVisible = visible;
  }

  public render(): void {
    if (this._isVisible) {
      super.render();
    }
  }
}

/**
 * @pattern Composite
 * @description Map region containing multiple layers
 */
export class MapRegion extends MapComposite {
  private _regionType: string;
  private _layers: MapLayer[] = [];

  constructor(name: string, regionType: string, x: number, y: number, width: number, height: number) {
    super(name, x, y, width, height);
    this._regionType = regionType;
  }

  public get regionType(): string {
    return this._regionType;
  }

  public addLayer(layer: MapLayer): void {
    this._layers.push(layer);
    this.add(layer);
  }

  public getLayer(layerId: number): MapLayer | null {
    return this._layers.find(layer => layer.layerId === layerId) || null;
  }

  public getLayers(): readonly MapLayer[] {
    return this._layers;
  }

  public render(): void {
    // Render layers in order (background to foreground)
    this._layers
      .sort((a, b) => a.layerId - b.layerId)
      .forEach(layer => layer.render());
  }
}


