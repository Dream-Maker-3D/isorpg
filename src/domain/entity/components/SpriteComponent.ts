/**
 * @pattern Component
 * @description Sprite component for entity visual representation
 */

import { Component } from '@gameKernel/Kernel';

/**
 * @pattern Component
 * @description Sprite component managing texture, frame, and visual properties
 */
export class SpriteComponent extends Component {
  public type: string = 'Sprite';
  private _textureKey: string;
  private _frame: number;
  private _animationState: string;
  private _visible: boolean;
  private _alpha: number;
  private _scale: number;
  private _rotation: number;
  private _flipX: boolean;
  private _flipY: boolean;

  constructor(
    textureKey: string = 'default_sprite',
    frame: number = 0,
    animationState: string = 'idle'
  ) {
    super('Sprite');
    this._textureKey = textureKey;
    this._frame = frame;
    this._animationState = animationState;
    this._visible = true;
    this._alpha = 1.0;
    this._scale = 1.0;
    this._rotation = 0;
    this._flipX = false;
    this._flipY = false;
  }

  // Getters
  public get textureKey(): string {
    return this._textureKey;
  }

  public get frame(): number {
    return this._frame;
  }

  public get animationState(): string {
    return this._animationState;
  }

  public get visible(): boolean {
    return this._visible;
  }

  public get alpha(): number {
    return this._alpha;
  }

  public get scale(): number {
    return this._scale;
  }

  public get rotation(): number {
    return this._rotation;
  }

  public get flipX(): boolean {
    return this._flipX;
  }

  public get flipY(): boolean {
    return this._flipY;
  }

  // Setters
  public setTextureKey(textureKey: string): void {
    this._textureKey = textureKey;
  }

  public setFrame(frame: number): void {
    this._frame = Math.max(0, frame);
  }

  public setAnimationState(state: string): void {
    this._animationState = state;
  }

  public setVisible(visible: boolean): void {
    this._visible = visible;
  }

  public setAlpha(alpha: number): void {
    this._alpha = Math.max(0, Math.min(1, alpha));
  }

  public setScale(scale: number): void {
    this._scale = Math.max(0.1, scale);
  }

  public setRotation(rotation: number): void {
    this._rotation = rotation;
  }

  public setFlipX(flipX: boolean): void {
    this._flipX = flipX;
  }

  public setFlipY(flipY: boolean): void {
    this._flipY = flipY;
  }

  // Animation methods
  public nextFrame(): void {
    this._frame++;
  }

  public previousFrame(): void {
    this._frame = Math.max(0, this._frame - 1);
  }

  public resetFrame(): void {
    this._frame = 0;
  }

  public setFrameRange(startFrame: number, endFrame: number): void {
    if (this._frame < startFrame || this._frame > endFrame) {
      this._frame = startFrame;
    }
  }

  // Visual effects
  public fadeIn(duration: number = 1000): void {
    this._alpha = 0;
    // In a real implementation, this would animate over time
    setTimeout(() => this.setAlpha(1), duration);
  }

  public fadeOut(duration: number = 1000): void {
    this._alpha = 1;
    // In a real implementation, this would animate over time
    setTimeout(() => this.setAlpha(0), duration);
  }

  public pulse(scale: number = 1.2, duration: number = 500): void {
    const originalScale = this._scale;
    this._scale = scale;
    // In a real implementation, this would animate over time
    setTimeout(() => this.setScale(originalScale), duration);
  }

  // Utility methods
  public clone(): SpriteComponent {
    const clone = new SpriteComponent(this._textureKey, this._frame, this._animationState);
    clone.setVisible(this._visible);
    clone.setAlpha(this._alpha);
    clone.setScale(this._scale);
    clone.setRotation(this._rotation);
    clone.setFlipX(this._flipX);
    clone.setFlipY(this._flipY);
    return clone;
  }

  public toString(): string {
    return `Sprite(${this._textureKey}, frame: ${this._frame}, state: ${this._animationState})`;
  }

  public toObject(): {
    textureKey: string;
    frame: number;
    animationState: string;
    visible: boolean;
    alpha: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
  } {
    return {
      textureKey: this._textureKey,
      frame: this._frame,
      animationState: this._animationState,
      visible: this._visible,
      alpha: this._alpha,
      scale: this._scale,
      rotation: this._rotation,
      flipX: this._flipX,
      flipY: this._flipY
    };
  }

  public reset(): void {
    this._frame = 0;
    this._animationState = 'idle';
    this._visible = true;
    this._alpha = 1.0;
    this._scale = 1.0;
    this._rotation = 0;
    this._flipX = false;
    this._flipY = false;
  }
}

