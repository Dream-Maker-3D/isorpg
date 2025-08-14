/**
 * @pattern Singleton
 * @description Manages sprite loading, caching, and texture management
 */

import { Direction, AnimationType } from '@domain/entity/components/AnimationComponent';

export interface SpriteTexture {
  readonly key: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly loaded: boolean;
}

export interface CharacterSpriteSet {
  readonly characterClass: string;
  readonly animations: Map<string, SpriteTexture[]>;
}

/**
 * @pattern Singleton
 * @description Global sprite management service
 */
export class SpriteManager {
  private static instance: SpriteManager;
  private _textures: Map<string, SpriteTexture> = new Map();
  private _characterSets: Map<string, CharacterSpriteSet> = new Map();
  private _loaded: boolean = false;

  private constructor() {}

  public static getInstance(): SpriteManager {
    if (!SpriteManager.instance) {
      SpriteManager.instance = new SpriteManager();
    }
    return SpriteManager.instance;
  }

  public get loaded(): boolean {
    return this._loaded;
  }

  /**
   * @pattern Singleton
   * @description Load character sprite set
   */
  public async loadCharacterSprites(characterClass: string): Promise<CharacterSpriteSet> {
    if (this._characterSets.has(characterClass)) {
      return this._characterSets.get(characterClass)!;
    }

    const animations = new Map<string, SpriteTexture[]>();
    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    const animationTypes: AnimationType[] = ['idle', 'walk', 'attack', 'cast'];

    // Load all animation types for all directions
    for (const animationType of animationTypes) {
      for (const direction of directions) {
        const frames: SpriteTexture[] = [];
        const frameCount = animationType === 'idle' ? 1 : 4; // Idle has 1 frame, others have 4

        for (let frame = 0; frame < frameCount; frame++) {
          const key = `${characterClass}_${animationType}_${direction}_${frame}`;
          const texture = await this.loadTexture(key);
          frames.push(texture);
        }

        const animationKey = `${animationType}_${direction}`;
        animations.set(animationKey, frames);
      }
    }

    const spriteSet: CharacterSpriteSet = {
      characterClass,
      animations
    };

    this._characterSets.set(characterClass, spriteSet);
    return spriteSet;
  }

  /**
   * @pattern Singleton
   * @description Load individual texture
   */
  public async loadTexture(key: string): Promise<SpriteTexture> {
    if (this._textures.has(key)) {
      return this._textures.get(key)!;
    }

    // In a real implementation, this would load from actual image files
    // For now, we create placeholder textures
    const texture: SpriteTexture = {
      key,
      url: `/assets/sprites/${key}.png`,
      width: 32,
      height: 32,
      loaded: true
    };

    this._textures.set(key, texture);
    return texture;
  }

  /**
   * @pattern Singleton
   * @description Get texture by key
   */
  public getTexture(key: string): SpriteTexture | null {
    return this._textures.get(key) || null;
  }

  /**
   * @pattern Singleton
   * @description Get character sprite set
   */
  public getCharacterSet(characterClass: string): CharacterSpriteSet | null {
    return this._characterSets.get(characterClass) || null;
  }

  /**
   * @pattern Singleton
   * @description Get animation frames for character
   */
  public getAnimationFrames(
    characterClass: string, 
    animationType: AnimationType, 
    direction: Direction
  ): SpriteTexture[] | null {
    const characterSet = this.getCharacterSet(characterClass);
    if (!characterSet) {
      return null;
    }

    const animationKey = `${animationType}_${direction}`;
    return characterSet.animations.get(animationKey) || null;
  }

  /**
   * @pattern Singleton
   * @description Get current frame texture for animation
   */
  public getCurrentFrameTexture(
    characterClass: string,
    animationType: AnimationType,
    direction: Direction,
    frameIndex: number
  ): SpriteTexture | null {
    const frames = this.getAnimationFrames(characterClass, animationType, direction);
    if (!frames || frameIndex >= frames.length) {
      return null;
    }

    return frames[frameIndex];
  }

  /**
   * @pattern Singleton
   * @description Preload all character sprites
   */
  public async preloadAllCharacters(): Promise<void> {
    const characterClasses = ['warrior', 'wizard', 'archer', 'rogue'];
    
    await Promise.all(
      characterClasses.map(characterClass => this.loadCharacterSprites(characterClass))
    );

    this._loaded = true;
    console.log('All character sprites preloaded');
  }

  /**
   * @pattern Singleton
   * @description Clear all loaded textures (for testing)
   */
  public clear(): void {
    this._textures.clear();
    this._characterSets.clear();
    this._loaded = false;
  }

  /**
   * @pattern Singleton
   * @description Get loading statistics
   */
  public getStats(): {
    totalTextures: number;
    totalCharacterSets: number;
    loaded: boolean;
  } {
    return {
      totalTextures: this._textures.size,
      totalCharacterSets: this._characterSets.size,
      loaded: this._loaded
    };
  }
}


