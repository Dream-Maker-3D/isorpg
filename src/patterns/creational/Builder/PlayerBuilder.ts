/**
 * @pattern Builder
 * @description Builder pattern for flexible player creation
 */

import { Player } from '@domain/entity/Player';
import { CharacterClass, CharacterClassFactory } from '@domain/valueObject/CharacterClass';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';
import { InventoryComponent } from '@domain/entity/components/InventoryComponent';
import { AnimationComponent } from '@domain/entity/components/AnimationComponent';

/**
 * @pattern Builder
 * @description Player builder interface
 */
export interface IPlayerBuilder {
  setName(name: string): IPlayerBuilder;
  setCharacterClass(characterClass: CharacterClass): IPlayerBuilder;
  setPosition(x: number, y: number, z?: number): IPlayerBuilder;
  setInventoryCapacity(capacity: number): IPlayerBuilder;
  setEntityId(id?: string): IPlayerBuilder;
  build(): Player;
}

/**
 * @pattern Builder
 * @description Concrete player builder implementation
 */
export class PlayerBuilder implements IPlayerBuilder {
  private name: string = '';
  private characterClass: CharacterClass | null = null;
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private inventoryCapacity: number = 10;
  private entityId: string = '';

  /**
   * @pattern Builder
   * @description Set player name
   */
  public setName(name: string): IPlayerBuilder {
    this.name = name;
    return this;
  }

  /**
   * @pattern Builder
   * @description Set character class
   */
  public setCharacterClass(characterClass: CharacterClass): IPlayerBuilder {
    this.characterClass = characterClass;
    return this;
  }

  /**
   * @pattern Builder
   * @description Set player position
   */
  public setPosition(x: number, y: number, z: number = 0): IPlayerBuilder {
    this.position = { x, y, z };
    return this;
  }

  /**
   * @pattern Builder
   * @description Set inventory capacity
   */
  public setInventoryCapacity(capacity: number): IPlayerBuilder {
    this.inventoryCapacity = Math.max(1, capacity);
    return this;
  }

  /**
   * @pattern Builder
   * @description Set entity ID
   */
  public setEntityId(id?: string): IPlayerBuilder {
    this.entityId = id || this.generateEntityId();
    return this;
  }

  /**
   * @pattern Builder
   * @description Build the player entity
   */
  public build(): Player {
    if (!this.name) {
      throw new Error('Player name is required');
    }
    if (!this.characterClass) {
      throw new Error('Character class is required');
    }

    // Generate entity ID if not set
    if (!this.entityId) {
      this.entityId = this.generateEntityId();
    }

    // Create components
    const positionComponent = new PositionComponent(this.position.x, this.position.y, this.position.z);
    const spriteComponent = new SpriteComponent(this.characterClass.spriteKey);
    const inventoryComponent = new InventoryComponent(this.inventoryCapacity);
    const animationComponent = new AnimationComponent();

    // Create and return player
    return new Player(
      this.entityId,
      this.name,
      this.characterClass,
      positionComponent,
      spriteComponent,
      inventoryComponent,
      animationComponent
    );
  }

  /**
   * @pattern Builder
   * @description Generate unique entity ID
   */
  private generateEntityId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * @pattern Factory Method
   * @description Create wizard player with default settings
   */
  public static createWizard(name: string): Player {
    const characterClass = CharacterClassFactory.fromType('WIZARD');
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(5, 5, 0)
      .setInventoryCapacity(15)
      .build();
  }

  /**
   * @pattern Factory Method
   * @description Create warrior player with default settings
   */
  public static createWarrior(name: string): Player {
    const characterClass = CharacterClassFactory.fromType('WARRIOR');
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(5, 5, 0)
      .setInventoryCapacity(12)
      .build();
  }

  /**
   * @pattern Factory Method
   * @description Create rogue player with default settings
   */
  public static createRogue(name: string): Player {
    const characterClass = CharacterClassFactory.fromType('ROGUE');
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(5, 5, 0)
      .setInventoryCapacity(18)
      .build();
  }

  /**
   * @pattern Factory Method
   * @description Create cleric player with default settings
   */
  public static createCleric(name: string): Player {
    const characterClass = CharacterClassFactory.fromType('CLERIC');
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(5, 5, 0)
      .setInventoryCapacity(14)
      .build();
  }

  /**
   * @pattern Factory Method
   * @description Create player from character class type
   */
  public static createFromType(name: string, characterClassType: string): Player {
    const characterClass = CharacterClassFactory.fromType(characterClassType as any);
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(5, 5, 0)
      .setInventoryCapacity(12)
      .build();
  }

  /**
   * @pattern Factory Method
   * @description Create custom player with all options
   */
  public static createCustom(
    name: string,
    characterClass: CharacterClass,
    x: number = 5,
    y: number = 5,
    z: number = 0,
    inventoryCapacity: number = 12
  ): Player {
    return new PlayerBuilder()
      .setName(name)
      .setCharacterClass(characterClass)
      .setPosition(x, y, z)
      .setInventoryCapacity(inventoryCapacity)
      .build();
  }
}

