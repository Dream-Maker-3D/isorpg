/**
 * @pattern Entity
 * @description Player entity with convenience methods for game logic
 */

import { Entity, Component } from '@gameKernel/Kernel';
import { CharacterClass } from '@domain/valueObject/CharacterClass';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';
import { InventoryComponent, InventoryItem } from '@domain/entity/components/InventoryComponent';
import { AnimationComponent, Direction, AnimationType, AnimationConfig } from '@domain/entity/components/AnimationComponent';
import { SpriteManager } from '@domain/service/SpriteManager';

/**
 * @pattern Entity
 * @description Player entity with game-specific convenience methods
 */
export class Player extends Entity {
  private _name: string;
  private _characterClass: CharacterClass;

  constructor(
    id: string,
    name: string,
    characterClass: CharacterClass,
    ...components: Component[]
  ) {
    super(id);
    this._name = name;
    this._characterClass = characterClass;
    
    // Add all provided components
    components.forEach(component => this.addComponent(component));
    
    // Initialize animation system if animation component is present
    this.initializeAnimationSystem();
  }

  // Convenience getters
  public get name(): string {
    return this._name;
  }

  public get characterClass(): CharacterClass {
    return this._characterClass;
  }

  public get position(): PositionComponent | undefined {
    return this.getComponent<PositionComponent>('Position');
  }

  public get sprite(): SpriteComponent | undefined {
    return this.getComponent<SpriteComponent>('Sprite');
  }

  public get inventory(): InventoryComponent | undefined {
    return this.getComponent<InventoryComponent>('Inventory');
  }

  public get animation(): AnimationComponent | undefined {
    return this.getComponent<AnimationComponent>('Animation');
  }

  // Position convenience methods
  public getX(): number {
    return this.position?.x ?? 0;
  }

  public getY(): number {
    return this.position?.y ?? 0;
  }

  public getZ(): number {
    return this.position?.z ?? 0;
  }

  public setPosition(x: number, y: number, z: number = 0): void {
    this.position?.setPosition(x, y, z);
  }

  public move(deltaX: number, deltaY: number, deltaZ: number = 0): void {
    this.position?.move(deltaX, deltaY, deltaZ);
  }

  // Animation convenience methods
  public setDirection(direction: Direction): void {
    if (this.animation) {
      const currentType = this.animation.currentState.type;
      this.animation.setAnimation(currentType, direction);
      this.updateSpriteTexture();
    }
  }

  public setAnimationType(type: AnimationType): void {
    if (this.animation) {
      const currentDirection = this.animation.currentState.direction;
      this.animation.setAnimation(type, currentDirection);
      this.updateSpriteTexture();
    }
  }

  public playAnimation(type: AnimationType, direction: Direction): void {
    if (this.animation) {
      this.animation.setAnimation(type, direction);
      this.animation.play();
      this.updateSpriteTexture();
    }
  }

  public stopAnimation(): void {
    this.animation?.stop();
  }

  public pauseAnimation(): void {
    this.animation?.pause();
  }

  public resumeAnimation(): void {
    this.animation?.play();
  }

  public updateAnimation(currentTime: number): void {
    if (this.animation) {
      this.animation.update(currentTime);
      this.updateSpriteTexture();
    }
  }

  public getCurrentDirection(): Direction {
    return this.animation?.direction ?? 'south';
  }

  public getCurrentAnimationType(): AnimationType {
    return this.animation?.animationType ?? 'idle';
  }

  public isAnimationComplete(): boolean {
    return this.animation?.isComplete() ?? false;
  }

  // Sprite convenience methods
  public setSpriteAnimationState(state: string): void {
    this.sprite?.setAnimationState(state);
  }

  public playSpriteAnimation(animationName: string): void {
    this.sprite?.playAnimation(animationName);
  }

  public setVisible(visible: boolean): void {
    this.sprite?.setVisible(visible);
  }

  // Inventory convenience methods
  public addItem(item: InventoryItem): boolean {
    return this.inventory?.addItem(item) ?? false;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    return this.inventory?.removeItem(itemId, quantity) ?? false;
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    return this.inventory?.hasItem(itemId, quantity) ?? false;
  }

  public getItem(itemId: string): InventoryItem | undefined {
    return this.inventory?.getItem(itemId);
  }

  public addGold(amount: number): void {
    this.inventory?.addGold(amount);
  }

  public removeGold(amount: number): boolean {
    return this.inventory?.removeGold(amount) ?? false;
  }

  public getGold(): number {
    return this.inventory?.gold ?? 0;
  }

  public getInventorySize(): number {
    return this.inventory?.currentCapacity ?? 0;
  }

  public getMaxInventorySize(): number {
    return this.inventory?.maxCapacity ?? 0;
  }

  public isInventoryFull(): boolean {
    return this.inventory?.isFull ?? true;
  }

  // Character class convenience methods
  public getStats() {
    return this._characterClass.stats;
  }

  public getHealth(): number {
    return this._characterClass.stats.health;
  }

  public getMana(): number {
    return this._characterClass.stats.mana;
  }

  public getAttack(): number {
    return this._characterClass.stats.attack;
  }

  public getDefense(): number {
    return this._characterClass.stats.defense;
  }

  public getSpeed(): number {
    return this._characterClass.stats.speed;
  }

  public getSpriteKey(): string {
    return this._characterClass.spriteKey;
  }

  public getDescription(): string {
    return this._characterClass.description;
  }

  // Utility methods
  public distanceTo(other: Player): number {
    const thisPos = this.position;
    const otherPos = other.position;
    
    if (!thisPos || !otherPos) {
      return Infinity;
    }
    
    return thisPos.distanceTo(otherPos);
  }

  public isAtPosition(x: number, y: number, z: number = 0): boolean {
    return this.getX() === x && this.getY() === y && this.getZ() === z;
  }

  /**
   * @pattern Template Method
   * @description Initialize animation system for the player
   */
  private initializeAnimationSystem(): void {
    if (!this.animation) {
      return;
    }

    const characterClass = this._characterClass.type.toLowerCase();
    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    const animationTypes: AnimationType[] = ['idle', 'walk', 'attack', 'cast'];

    // Add animation configurations
    for (const animationType of animationTypes) {
      for (const direction of directions) {
        const config: AnimationConfig = {
          type: animationType,
          direction: direction,
          totalFrames: animationType === 'idle' ? 1 : 4,
          frameRate: animationType === 'idle' ? 1 : 8,
          isLooping: animationType !== 'attack' && animationType !== 'cast'
        };
        
        this.animation.addAnimation(config);
      }
    }

    // Set initial animation
    this.animation.setAnimation('idle', 'south');
  }

  /**
   * @pattern Template Method
   * @description Update sprite texture based on current animation state
   */
  private updateSpriteTexture(): void {
    if (!this.animation || !this.sprite) {
      return;
    }

    const characterClass = this._characterClass.type.toLowerCase();
    const { type, direction, currentFrame } = this.animation.currentState;
    
    const spriteManager = SpriteManager.getInstance();
    const texture = spriteManager.getCurrentFrameTexture(characterClass, type, direction, currentFrame);
    
    if (texture) {
      this.sprite.setTexture(texture.key);
    }
  }

  public toString(): string {
    return `Player(${this._name}, ${this._characterClass.type})`;
  }

  /**
   * @pattern Factory Method
   * @description Create player from base entity
   */
  public static fromEntity(
    entity: Entity,
    name: string,
    characterClass: CharacterClass
  ): Player {
    // Note: This is a simplified approach - in a real implementation,
    // you might want to deep clone the components or access entity ID differently
    const player = new Player('player_' + Date.now(), name, characterClass);
    return player;
  }
}
