/**
 * @pattern Component
 * @description Handles entity animation state and frame management
 */

export type Direction = 'north' | 'south' | 'east' | 'west';
export type AnimationType = 'idle' | 'walk' | 'attack' | 'cast';

export interface AnimationState {
  readonly type: AnimationType;
  readonly direction: Direction;
  readonly currentFrame: number;
  readonly totalFrames: number;
  readonly frameRate: number;
  readonly isLooping: boolean;
  readonly isPlaying: boolean;
}

export interface AnimationConfig {
  readonly type: AnimationType;
  readonly direction: Direction;
  readonly totalFrames: number;
  readonly frameRate: number;
  readonly isLooping?: boolean;
}

/**
 * @pattern Component
 * @description Manages entity animation state and frame progression
 */
export class AnimationComponent extends Component {
  public type: string = 'AnimationComponent';
  public entityId: string = '';
  private _currentState: AnimationState;
  private _lastFrameTime: number = 0;
  private _configurations: Map<string, AnimationConfig> = new Map();

  constructor() {
    this._currentState = {
      type: 'idle',
      direction: 'south',
      currentFrame: 0,
      totalFrames: 1,
      frameRate: 8,
      isLooping: true,
      isPlaying: true
    };
  }

  public get currentState(): AnimationState {
    return this._currentState;
  }

  public get currentFrame(): number {
    return this._currentState.currentFrame;
  }

  public get direction(): Direction {
    return this._currentState.direction;
  }

  public get animationType(): AnimationType {
    return this._currentState.animationType;
  }

  public get isPlaying(): boolean {
    return this._currentState.isPlaying;
  }

  /**
   * @pattern Component
   * @description Add animation configuration
   */
  public addAnimation(config: AnimationConfig): void {
    const key = `${config.type}_${config.direction}`;
    this._configurations.set(key, config);
  }

  /**
   * @pattern Component
   * @description Set animation state
   */
  public setAnimation(type: AnimationType, direction: Direction): void {
    const key = `${type}_${direction}`;
    const config = this._configurations.get(key);
    
    if (config) {
      this._currentState = {
        type: config.type,
        direction: config.direction,
        currentFrame: 0,
        totalFrames: config.totalFrames,
        frameRate: config.frameRate,
        isLooping: config.isLooping ?? true,
        isPlaying: true
      };
    }
  }

  /**
   * @pattern Component
   * @description Update animation frame based on time
   */
  public update(currentTime: number): void {
    if (!this._currentState.isPlaying) {
      return;
    }

    const frameInterval = 1000 / this._currentState.frameRate;
    
    if (currentTime - this._lastFrameTime >= frameInterval) {
      this._currentState = {
        ...this._currentState,
        currentFrame: this._currentState.currentFrame + 1
      };

      // Handle frame wrapping
      if (this._currentState.currentFrame >= this._currentState.totalFrames) {
        if (this._currentState.isLooping) {
          this._currentState = {
            ...this._currentState,
            currentFrame: 0
          };
        } else {
          this._currentState = {
            ...this._currentState,
            isPlaying: false,
            currentFrame: this._currentState.totalFrames - 1
          };
        }
      }

      this._lastFrameTime = currentTime;
    }
  }

  /**
   * @pattern Component
   * @description Play animation
   */
  public play(): void {
    this._currentState = {
      ...this._currentState,
      isPlaying: true
    };
  }

  /**
   * @pattern Component
   * @description Pause animation
   */
  public pause(): void {
    this._currentState = {
      ...this._currentState,
      isPlaying: false
    };
  }

  /**
   * @pattern Component
   * @description Stop animation and reset to first frame
   */
  public stop(): void {
    this._currentState = {
      ...this._currentState,
      currentFrame: 0,
      isPlaying: false
    };
  }

  /**
   * @pattern Component
   * @description Get texture key for current frame
   */
  public getTextureKey(): string {
    const { type, direction, currentFrame } = this._currentState;
    return `${type}_${direction}_${currentFrame}`;
  }

  /**
   * @pattern Component
   * @description Check if animation is complete (for non-looping animations)
   */
  public isComplete(): boolean {
    return !this._currentState.isLooping && 
           this._currentState.currentFrame >= this._currentState.totalFrames - 1;
  }

  /**
   * @pattern Component
   * @description Reset animation to beginning
   */
  public reset(): void {
    this._currentState = {
      ...this._currentState,
      currentFrame: 0,
      isPlaying: true
    };
  }

  public toString(): string {
    const { type, direction, currentFrame, totalFrames, isPlaying } = this._currentState;
    return `AnimationComponent(${type}_${direction} ${currentFrame}/${totalFrames} ${isPlaying ? 'playing' : 'paused'})`;
  }
}
