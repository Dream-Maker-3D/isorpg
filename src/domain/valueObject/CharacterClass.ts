/**
 * @pattern Value Object
 * @description Immutable character class definitions
 */

export type CharacterClassType = 'WIZARD' | 'WARRIOR' | 'ROGUE' | 'CLERIC';

/**
 * @pattern Value Object
 * @description Character class properties interface
 */
export interface CharacterClassProperties {
  readonly type: CharacterClassType;
  readonly name: string;
  readonly description: string;
  readonly baseHealth: number;
  readonly baseMana: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseSpeed: number;
  readonly spriteKey: string;
  readonly abilities: string[];
}

/**
 * @pattern Value Object
 * @description Character class with immutable properties
 */
export class CharacterClass implements CharacterClassProperties {
  public readonly type: CharacterClassType;
  public readonly name: string;
  public readonly description: string;
  public readonly baseHealth: number;
  public readonly baseMana: number;
  public readonly baseAttack: number;
  public readonly baseDefense: number;
  public readonly baseSpeed: number;
  public readonly spriteKey: string;
  public readonly abilities: string[];

  constructor(properties: CharacterClassProperties) {
    this.type = properties.type;
    this.name = properties.name;
    this.description = properties.description;
    this.baseHealth = properties.baseHealth;
    this.baseMana = properties.baseMana;
    this.baseAttack = properties.baseAttack;
    this.baseDefense = properties.baseDefense;
    this.baseSpeed = properties.baseSpeed;
    this.spriteKey = properties.spriteKey;
    this.abilities = [...properties.abilities]; // Create copy to maintain immutability
  }

  /**
   * @pattern Value Object
   * @description Check if character class equals another
   */
  public equals(other: CharacterClass): boolean {
    return this.type === other.type;
  }

  /**
   * @pattern Value Object
   * @description Get character class display name
   */
  public getDisplayName(): string {
    return this.name;
  }

  /**
   * @pattern Value Object
   * @description Get character class description
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * @pattern Value Object
   * @description Get base stats for the character class
   */
  public getBaseStats() {
    return {
      health: this.baseHealth,
      mana: this.baseMana,
      attack: this.baseAttack,
      defense: this.baseDefense,
      speed: this.baseSpeed
    };
  }

  /**
   * @pattern Value Object
   * @description Get available abilities
   */
  public getAbilities(): string[] {
    return [...this.abilities]; // Return copy to maintain immutability
  }

  /**
   * @pattern Value Object
   * @description Get sprite key for rendering
   */
  public getSpriteKey(): string {
    return this.spriteKey;
  }
}

/**
 * @pattern Factory Method
 * @description Factory for creating character classes
 */
export class CharacterClassFactory {
  private static readonly CLASSES: Map<CharacterClassType, CharacterClass> = new Map([
    ['WIZARD', new CharacterClass({
      type: 'WIZARD',
      name: 'Wizard',
      description: 'A powerful spellcaster with arcane knowledge',
      baseHealth: 80,
      baseMana: 120,
      baseAttack: 60,
      baseDefense: 40,
      baseSpeed: 70,
      spriteKey: 'wizard_sprite',
      abilities: ['Fireball', 'Ice Bolt', 'Teleport', 'Shield']
    })],
    ['WARRIOR', new CharacterClass({
      type: 'WARRIOR',
      name: 'Warrior',
      description: 'A mighty fighter with exceptional combat skills',
      baseHealth: 120,
      baseMana: 40,
      baseAttack: 100,
      baseDefense: 80,
      baseSpeed: 60,
      spriteKey: 'warrior_sprite',
      abilities: ['Slash', 'Charge', 'Defend', 'Battle Cry']
    })],
    ['ROGUE', new CharacterClass({
      type: 'ROGUE',
      name: 'Rogue',
      description: 'A stealthy assassin with deadly precision',
      baseHealth: 90,
      baseMana: 60,
      baseAttack: 90,
      baseDefense: 50,
      baseSpeed: 100,
      spriteKey: 'rogue_sprite',
      abilities: ['Backstab', 'Stealth', 'Poison', 'Evasion']
    })],
    ['CLERIC', new CharacterClass({
      type: 'CLERIC',
      name: 'Cleric',
      description: 'A divine healer with protective magic',
      baseHealth: 100,
      baseMana: 100,
      baseAttack: 70,
      baseDefense: 70,
      baseSpeed: 65,
      spriteKey: 'cleric_sprite',
      abilities: ['Heal', 'Bless', 'Smite', 'Protection']
    })]
  ]);

  /**
   * @pattern Factory Method
   * @description Create character class by type
   */
  public static fromType(type: CharacterClassType): CharacterClass {
    const characterClass = this.CLASSES.get(type);
    if (!characterClass) {
      throw new Error(`Unknown character class type: ${type}`);
    }
    return characterClass;
  }

  /**
   * @pattern Factory Method
   * @description Get all available character classes
   */
  public static getAllClasses(): CharacterClass[] {
    return Array.from(this.CLASSES.values());
  }

  /**
   * @pattern Factory Method
   * @description Check if character class type is valid
   */
  public static isValidType(type: string): type is CharacterClassType {
    return this.CLASSES.has(type as CharacterClassType);
  }

  /**
   * @pattern Factory Method
   * @description Get character class by name (case-insensitive)
   */
  public static fromName(name: string): CharacterClass | undefined {
    const normalizedName = name.toUpperCase();
    for (const [type, characterClass] of this.CLASSES) {
      if (characterClass.name.toUpperCase() === normalizedName) {
        return characterClass;
      }
    }
    return undefined;
  }
}

