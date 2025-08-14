/**
 * @pattern Decorator
 * @description Item decorator system for enhancements and modifications
 */

import { Item, ItemProperties, ItemInstance } from '@domain/valueObject/Item';

/**
 * @pattern Decorator
 * @description Abstract item decorator interface
 */
export interface IItemDecorator {
  getProperties(): ItemProperties;
  getDisplayName(): string;
  getTooltip(): string;
  getValue(): number;
  getWeight(): number;
  getEnchantmentLevel(): number;
  getDurability(): number;
  getMaxDurability(): number;
  isEnchanted(): boolean;
  isDamaged(): boolean;
  isBroken(): boolean;
}

/**
 * @pattern Decorator
 * @description Base item decorator class
 */
export abstract class ItemDecorator implements IItemDecorator {
  protected item: Item;

  constructor(item: Item) {
    this.item = item;
  }

  public getProperties(): ItemProperties {
    return this.item;
  }

  public getDisplayName(): string {
    return this.item.getDisplayName();
  }

  public getTooltip(): string {
    return this.item.getTooltip();
  }

  public getValue(): number {
    return this.item.value;
  }

  public getWeight(): number {
    return this.item.weight;
  }

  public getEnchantmentLevel(): number {
    return 0;
  }

  public getDurability(): number {
    return 100;
  }

  public getMaxDurability(): number {
    return 100;
  }

  public isEnchanted(): boolean {
    return false;
  }

  public isDamaged(): boolean {
    return false;
  }

  public isBroken(): boolean {
    return false;
  }
}

/**
 * @pattern Concrete Decorator
 * @description Enchantment decorator for magical enhancements
 */
export class EnchantedItemDecorator extends ItemDecorator {
  private enchantmentLevel: number;
  private enchantmentType: string;
  private enchantmentBonus: number;

  constructor(item: Item, enchantmentType: string, enchantmentLevel: number = 1) {
    super(item);
    this.enchantmentType = enchantmentType;
    this.enchantmentLevel = Math.max(1, Math.min(10, enchantmentLevel)); // 1-10 levels
    this.enchantmentBonus = this.calculateEnchantmentBonus();
  }

  public getDisplayName(): string {
    const enchantmentPrefix = this.getEnchantmentPrefix();
    return `${enchantmentPrefix} ${this.item.name}`;
  }

  public getTooltip(): string {
    const baseTooltip = this.item.getTooltip();
    const enchantmentInfo = `\nEnchanted: ${this.enchantmentType} +${this.enchantmentBonus}`;
    return baseTooltip + enchantmentInfo;
  }

  public getValue(): number {
    return this.item.value + (this.enchantmentBonus * 50); // +50 gold per bonus point
  }

  public getEnchantmentLevel(): number {
    return this.enchantmentLevel;
  }

  public isEnchanted(): boolean {
    return true;
  }

  private calculateEnchantmentBonus(): number {
    const baseBonus = this.enchantmentLevel * 2;
    const typeMultiplier = this.getEnchantmentTypeMultiplier();
    return Math.floor(baseBonus * typeMultiplier);
  }

  private getEnchantmentTypeMultiplier(): number {
    const multipliers: { [key: string]: number } = {
      'fire': 1.5,
      'ice': 1.3,
      'lightning': 1.4,
      'poison': 1.2,
      'holy': 1.6,
      'dark': 1.5,
      'strength': 1.0,
      'agility': 1.0,
      'intelligence': 1.0
    };
    return multipliers[this.enchantmentType] || 1.0;
  }

  private getEnchantmentPrefix(): string {
    const prefixes: { [key: string]: string } = {
      'fire': 'Flaming',
      'ice': 'Frozen',
      'lightning': 'Thunder',
      'poison': 'Venomous',
      'holy': 'Blessed',
      'dark': 'Cursed',
      'strength': 'Mighty',
      'agility': 'Swift',
      'intelligence': 'Wise'
    };
    return prefixes[this.enchantmentType] || 'Enchanted';
  }
}

/**
 * @pattern Concrete Decorator
 * @description Durability decorator for item wear and tear
 */
export class DurableItemDecorator extends ItemDecorator {
  private currentDurability: number;
  private maxDurability: number;

  constructor(item: Item, maxDurability: number = 100) {
    super(item);
    this.maxDurability = maxDurability;
    this.currentDurability = maxDurability;
  }

  public getDisplayName(): string {
    const durabilitySuffix = this.getDurabilitySuffix();
    return `${this.item.name} ${durabilitySuffix}`;
  }

  public getTooltip(): string {
    const baseTooltip = this.item.getTooltip();
    const durabilityInfo = `\nDurability: ${this.currentDurability}/${this.maxDurability}`;
    return baseTooltip + durabilityInfo;
  }

  public getValue(): number {
    const durabilityRatio = this.currentDurability / this.maxDurability;
    return Math.floor(this.item.value * durabilityRatio);
  }

  public getDurability(): number {
    return this.currentDurability;
  }

  public getMaxDurability(): number {
    return this.maxDurability;
  }

  public isDamaged(): boolean {
    return this.currentDurability < this.maxDurability;
  }

  public isBroken(): boolean {
    return this.currentDurability <= 0;
  }

  /**
   * @pattern Decorator
   * @description Reduce item durability
   */
  public reduceDurability(amount: number): void {
    this.currentDurability = Math.max(0, this.currentDurability - amount);
  }

  /**
   * @pattern Decorator
   * @description Repair item durability
   */
  public repair(amount: number): void {
    this.currentDurability = Math.min(this.maxDurability, this.currentDurability + amount);
  }

  /**
   * @pattern Decorator
   * @description Fully repair item
   */
  public fullRepair(): void {
    this.currentDurability = this.maxDurability;
  }

  private getDurabilitySuffix(): string {
    const ratio = this.currentDurability / this.maxDurability;
    
    if (ratio >= 0.8) return '(Excellent)';
    if (ratio >= 0.6) return '(Good)';
    if (ratio >= 0.4) return '(Fair)';
    if (ratio >= 0.2) return '(Poor)';
    if (ratio > 0) return '(Damaged)';
    return '(Broken)';
  }
}

/**
 * @pattern Concrete Decorator
 * @description Masterwork decorator for superior craftsmanship
 */
export class MasterworkItemDecorator extends ItemDecorator {
  private craftsmanshipBonus: number;

  constructor(item: Item) {
    super(item);
    this.craftsmanshipBonus = 25; // +25% to all stats
  }

  public getDisplayName(): string {
    return `Masterwork ${this.item.name}`;
  }

  public getTooltip(): string {
    const baseTooltip = this.item.getTooltip();
    const masterworkInfo = `\nMasterwork: Superior craftsmanship (+${this.craftsmanshipBonus}% bonus)`;
    return baseTooltip + masterworkInfo;
  }

  public getValue(): number {
    return Math.floor(this.item.value * 1.5); // +50% value
  }

  public getWeight(): number {
    return Math.floor(this.item.weight * 0.8); // -20% weight
  }
}

/**
 * @pattern Concrete Decorator
 * @description Legendary decorator for unique items
 */
export class LegendaryItemDecorator extends ItemDecorator {
  private legendaryEffect: string;
  private legendaryBonus: number;

  constructor(item: Item, legendaryEffect: string) {
    super(item);
    this.legendaryEffect = legendaryEffect;
    this.legendaryBonus = 50; // +50 bonus points
  }

  public getDisplayName(): string {
    return `Legendary ${this.item.name}`;
  }

  public getTooltip(): string {
    const baseTooltip = this.item.getTooltip();
    const legendaryInfo = `\nLegendary: ${this.legendaryEffect} (+${this.legendaryBonus} bonus)`;
    return baseTooltip + legendaryInfo;
  }

  public getValue(): number {
    return this.item.value * 5; // 5x value for legendary items
  }

  public getWeight(): number {
    return this.item.weight * 0.5; // -50% weight
  }
}

/**
 * @pattern Factory Method
 * @description Item decorator factory for creating enhanced items
 */
export class ItemDecoratorFactory {
  /**
   * @pattern Factory Method
   * @description Create enchanted item
   */
  public static createEnchantedItem(
    item: Item, 
    enchantmentType: string, 
    level: number = 1
  ): EnchantedItemDecorator {
    return new EnchantedItemDecorator(item, enchantmentType, level);
  }

  /**
   * @pattern Factory Method
   * @description Create durable item
   */
  public static createDurableItem(
    item: Item, 
    maxDurability: number = 100
  ): DurableItemDecorator {
    return new DurableItemDecorator(item, maxDurability);
  }

  /**
   * @pattern Factory Method
   * @description Create masterwork item
   */
  public static createMasterworkItem(item: Item): MasterworkItemDecorator {
    return new MasterworkItemDecorator(item);
  }

  /**
   * @pattern Factory Method
   * @description Create legendary item
   */
  public static createLegendaryItem(
    item: Item, 
    legendaryEffect: string
  ): LegendaryItemDecorator {
    return new LegendaryItemDecorator(item, legendaryEffect);
  }

  /**
   * @pattern Factory Method
   * @description Create item with multiple decorators
   */
  public static createEnhancedItem(
    item: Item,
    enhancements: {
      enchantment?: { type: string; level: number };
      durability?: number;
      masterwork?: boolean;
      legendary?: string;
    }
  ): IItemDecorator {
    let enhancedItem: IItemDecorator = item;

    if (enhancements.legendary) {
      enhancedItem = new LegendaryItemDecorator(item as Item, enhancements.legendary);
    }

    if (enhancements.masterwork) {
      enhancedItem = new MasterworkItemDecorator(item as Item);
    }

    if (enhancements.durability) {
      enhancedItem = new DurableItemDecorator(item as Item, enhancements.durability);
    }

    if (enhancements.enchantment) {
      enhancedItem = new EnchantedItemDecorator(
        item as Item, 
        enhancements.enchantment.type, 
        enhancements.enchantment.level
      );
    }

    return enhancedItem;
  }
}

