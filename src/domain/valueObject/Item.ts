/**
 * @pattern Value Object
 * @description Base item system with immutable properties
 */

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemSlot = 'weapon' | 'shield' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'accessory' | 'none';

/**
 * @pattern Value Object
 * @description Base item properties interface
 */
export interface ItemProperties {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: ItemType;
  readonly rarity: ItemRarity;
  readonly slot: ItemSlot;
  readonly weight: number;
  readonly value: number;
  readonly stackable: boolean;
  readonly maxStack: number;
  readonly icon: string;
  readonly spriteKey: string;
}

/**
 * @pattern Value Object
 * @description Item instance with quantity
 */
export interface ItemInstance {
  readonly item: ItemProperties;
  readonly quantity: number;
  readonly uniqueId: string;
}

/**
 * @pattern Value Object
 * @description Base item class with immutable properties
 */
export class Item implements ItemProperties {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly type: ItemType;
  public readonly rarity: ItemRarity;
  public readonly slot: ItemSlot;
  public readonly weight: number;
  public readonly value: number;
  public readonly stackable: boolean;
  public readonly maxStack: number;
  public readonly icon: string;
  public readonly spriteKey: string;

  constructor(properties: ItemProperties) {
    this.id = properties.id;
    this.name = properties.name;
    this.description = properties.description;
    this.type = properties.type;
    this.rarity = properties.rarity;
    this.slot = properties.slot;
    this.weight = properties.weight;
    this.value = properties.value;
    this.stackable = properties.stackable;
    this.maxStack = properties.maxStack;
    this.icon = properties.icon;
    this.spriteKey = properties.spriteKey;
  }

  /**
   * @pattern Value Object
   * @description Create item instance with quantity
   */
  public createInstance(quantity: number = 1): ItemInstance {
    return {
      item: this,
      quantity: Math.min(quantity, this.maxStack),
      uniqueId: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * @pattern Value Object
   * @description Check if item equals another item
   */
  public equals(other: Item): boolean {
    return this.id === other.id;
  }

  /**
   * @pattern Value Object
   * @description Get item display name with rarity color
   */
  public getDisplayName(): string {
    const rarityColors = {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000'
    };
    
    return `${this.name} (${this.rarity})`;
  }

  /**
   * @pattern Value Object
   * @description Get item tooltip text
   */
  public getTooltip(): string {
    return `${this.name}\n${this.description}\nType: ${this.type}\nRarity: ${this.rarity}\nValue: ${this.value} gold`;
  }

  public toString(): string {
    return `Item(${this.name}, ${this.type}, ${this.rarity})`;
  }
}

/**
 * @pattern Factory Method
 * @description Item factory for creating predefined items
 */
export class ItemFactory {
  private static readonly items: Map<string, Item> = new Map();

  /**
   * @pattern Factory Method
   * @description Initialize predefined items
   */
  static {
    // Weapons
    ItemFactory.items.set('sword_iron', new Item({
      id: 'sword_iron',
      name: 'Iron Sword',
      description: 'A sturdy iron sword',
      type: 'weapon',
      rarity: 'common',
      slot: 'weapon',
      weight: 3.0,
      value: 50,
      stackable: false,
      maxStack: 1,
      icon: 'sword_iron_icon',
      spriteKey: 'sword_iron'
    }));

    ItemFactory.items.set('sword_steel', new Item({
      id: 'sword_steel',
      name: 'Steel Sword',
      description: 'A well-crafted steel sword',
      type: 'weapon',
      rarity: 'uncommon',
      slot: 'weapon',
      weight: 3.5,
      value: 150,
      stackable: false,
      maxStack: 1,
      icon: 'sword_steel_icon',
      spriteKey: 'sword_steel'
    }));

    // Armor
    ItemFactory.items.set('armor_leather', new Item({
      id: 'armor_leather',
      name: 'Leather Armor',
      description: 'Light leather armor',
      type: 'armor',
      rarity: 'common',
      slot: 'chest',
      weight: 5.0,
      value: 30,
      stackable: false,
      maxStack: 1,
      icon: 'armor_leather_icon',
      spriteKey: 'armor_leather'
    }));

    ItemFactory.items.set('helmet_iron', new Item({
      id: 'helmet_iron',
      name: 'Iron Helmet',
      description: 'Protective iron helmet',
      type: 'armor',
      rarity: 'common',
      slot: 'helmet',
      weight: 2.0,
      value: 40,
      stackable: false,
      maxStack: 1,
      icon: 'helmet_iron_icon',
      spriteKey: 'helmet_iron'
    }));

    // Consumables
    ItemFactory.items.set('potion_health', new Item({
      id: 'potion_health',
      name: 'Health Potion',
      description: 'Restores 50 health points',
      type: 'consumable',
      rarity: 'common',
      slot: 'none',
      weight: 0.5,
      value: 25,
      stackable: true,
      maxStack: 99,
      icon: 'potion_health_icon',
      spriteKey: 'potion_health'
    }));

    ItemFactory.items.set('potion_mana', new Item({
      id: 'potion_mana',
      name: 'Mana Potion',
      description: 'Restores 50 mana points',
      type: 'consumable',
      rarity: 'common',
      slot: 'none',
      weight: 0.5,
      value: 30,
      stackable: true,
      maxStack: 99,
      icon: 'potion_mana_icon',
      spriteKey: 'potion_mana'
    }));

    // Materials
    ItemFactory.items.set('herb_red', new Item({
      id: 'herb_red',
      name: 'Red Herb',
      description: 'A red herb used in alchemy',
      type: 'material',
      rarity: 'common',
      slot: 'none',
      weight: 0.1,
      value: 5,
      stackable: true,
      maxStack: 999,
      icon: 'herb_red_icon',
      spriteKey: 'herb_red'
    }));

    ItemFactory.items.set('ore_iron', new Item({
      id: 'ore_iron',
      name: 'Iron Ore',
      description: 'Raw iron ore for smithing',
      type: 'material',
      rarity: 'common',
      slot: 'none',
      weight: 1.0,
      value: 10,
      stackable: true,
      maxStack: 999,
      icon: 'ore_iron_icon',
      spriteKey: 'ore_iron'
    }));

    // Quest Items
    ItemFactory.items.set('key_ancient', new Item({
      id: 'key_ancient',
      name: 'Ancient Key',
      description: 'An ancient key with mysterious markings',
      type: 'quest',
      rarity: 'rare',
      slot: 'none',
      weight: 0.2,
      value: 0,
      stackable: false,
      maxStack: 1,
      icon: 'key_ancient_icon',
      spriteKey: 'key_ancient'
    }));
  }

  /**
   * @pattern Factory Method
   * @description Get item by ID
   */
  public static getItem(id: string): Item | null {
    return ItemFactory.items.get(id) || null;
  }

  /**
   * @pattern Factory Method
   * @description Get all available items
   */
  public static getAllItems(): Item[] {
    return Array.from(ItemFactory.items.values());
  }

  /**
   * @pattern Factory Method
   * @description Get items by type
   */
  public static getItemsByType(type: ItemType): Item[] {
    return Array.from(ItemFactory.items.values()).filter(item => item.type === type);
  }

  /**
   * @pattern Factory Method
   * @description Get items by rarity
   */
  public static getItemsByRarity(rarity: ItemRarity): Item[] {
    return Array.from(ItemFactory.items.values()).filter(item => item.rarity === rarity);
  }

  /**
   * @pattern Factory Method
   * @description Create item instance by ID
   */
  public static createItemInstance(id: string, quantity: number = 1): ItemInstance | null {
    const item = ItemFactory.getItem(id);
    return item ? item.createInstance(quantity) : null;
  }
}

