/**
 * @pattern Component
 * @description Position component for entity spatial representation
 */

import { Component } from '@gameKernel/Kernel';

/**
 * @pattern Component
 * @description Position component managing x, y, z coordinates
 */
export class PositionComponent extends Component {
  public type: string = 'Position';
  private _x: number;
  private _y: number;
  private _z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super('Position');
    this._x = x;
    this._y = y;
    this._z = z;
  }

  // Getters
  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get z(): number {
    return this._z;
  }

  // Position methods
  public setPosition(x: number, y: number, z: number = 0): void {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public move(deltaX: number, deltaY: number, deltaZ: number = 0): void {
    this._x += deltaX;
    this._y += deltaY;
    this._z += deltaZ;
  }

  public moveTo(x: number, y: number, z?: number): void {
    this._x = x;
    this._y = y;
    if (z !== undefined) {
      this._z = z;
    }
  }

  public translate(deltaX: number, deltaY: number, deltaZ: number = 0): void {
    this.move(deltaX, deltaY, deltaZ);
  }

  // Utility methods
  public getDistanceTo(other: PositionComponent): number {
    const dx = this._x - other._x;
    const dy = this._y - other._y;
    const dz = this._z - other._z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public getDistanceTo2D(other: PositionComponent): number {
    const dx = this._x - other._x;
    const dy = this._y - other._y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public isAdjacent(other: PositionComponent): boolean {
    const distance = this.getDistanceTo2D(other);
    return distance <= 1.0;
  }

  public isAt(x: number, y: number, z?: number): boolean {
    if (z !== undefined) {
      return this._x === x && this._y === y && this._z === z;
    }
    return this._x === x && this._y === y;
  }

  public clone(): PositionComponent {
    return new PositionComponent(this._x, this._y, this._z);
  }

  public toString(): string {
    return `Position(${this._x}, ${this._y}, ${this._z})`;
  }

  public toArray(): [number, number, number] {
    return [this._x, this._y, this._z];
  }

  public toObject(): { x: number; y: number; z: number } {
    return { x: this._x, y: this._y, z: this._z };
  }
}

