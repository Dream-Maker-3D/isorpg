/**
 * @pattern Facade
 * @description Inventory service that integrates inventory system with player and provides simplified interface
 */

import { Player } from '@domain/entity/Player';
import { InventoryComponent, InventoryEvent } from '@domain/entity/components/InventoryComponent';
import { ItemInstance, ItemFactory } from '@domain/valueObject/Item';
import { IItemDecorator, ItemDecoratorFactory } from '@patterns/structural/Decorator/ItemDecorator';
import { EventBus } from '@gameKernel/Kernel';

/**
 * @pattern Facade
 * @description Inventory service providing simplified interface to inventory system
 */
export class InventoryService {
  private eventBus: EventBus;
  private inventoryCallbacks: Map<string, (event: InventoryEvent) => void> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  /**
   * @pattern Observer
   * @description Set up event listeners for inventory events
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('inventory:event', (event: InventoryEvent) => {
      this.handleInventoryEvent(event);
    });
  }

  /**
   * @pattern Observer
   * @description Handle inventory events and trigger callbacks
   */
  private handleInventoryEvent(event: InventoryEvent): void {
    if (!this.isEnabled) {
      return;
    }

    const callbackKey = `${event.entityId}_${event.eventType}`;
    const callback = this.inventoryCallbacks.get(callbackKey);
    
    if (callback) {
      callback(event);
    }

    // Also trigger general callbacks
    const generalCallback = this.inventoryCallbacks.get(event.eventType);
    if (generalCallback) {
      generalCallback(event);
    }
  }

  /**
   * @pattern Facade
   * @description Add item to player inventory
   */
  public addItemToPlayer(player: Player, itemId: string, quantity: number = 1): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    return inventoryComponent.addItemById(itemId, quantity);
  }

  /**
   * @pattern Facade
   * @description Add enhanced item to player inventory
   */
  public addEnhancedItemToPlayer(
    player: Player, 
    itemId: string, 
    enhancements: {
      enchantment?: { type: string; level: number };
      durability?: number;
      masterwork?: boolean;
      legendary?: string;
    },
    quantity: number = 1
  ): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    // Create base item
    const baseItem = ItemFactory.getItem(itemId);
    if (!baseItem) {
      return false;
    }

    // Apply enhancements
    const enhancedItem = ItemDecoratorFactory.createEnhancedItem(baseItem, enhancements);
    
    // Create item instance
    const itemInstance: ItemInstance = {
      item: enhancedItem.getProperties(),
      quantity: quantity,
      uniqueId: `${itemId}_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    return inventoryComponent.addItemInstance(itemInstance);
  }

  /**
   * @pattern Facade
   * @description Remove item from player inventory
   */
  public removeItemFromPlayer(player: Player, itemId: string, quantity: number = 1): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    return inventoryComponent.removeItemById(itemId, quantity);
  }

  /**
   * @pattern Facade
   * @description Check if player has item
   */
  public playerHasItem(player: Player, itemId: string, quantity: number = 1): boolean {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    // Check new item system first
    const itemInstance = inventoryComponent.findItemByItemId(itemId);
    if (itemInstance && itemInstance.quantity >= quantity) {
      return true;
    }

    // Check legacy system
    return inventoryComponent.hasItem(itemId, quantity);
  }

  /**
   * @pattern Facade
   * @description Get item from player inventory
   */
  public getPlayerItem(player: Player, itemId: string): ItemInstance | null {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return null;
    }

    return inventoryComponent.findItemByItemId(itemId);
  }

  /**
   * @pattern Facade
   * @description Get all items from player inventory
   */
  public getPlayerItems(player: Player): ItemInstance[] {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return [];
    }

    return Array.from(inventoryComponent.newItems.values());
  }

  /**
   * @pattern Facade
   * @description Add gold to player
   */
  public addGoldToPlayer(player: Player, amount: number): void {
    if (!this.isEnabled) {
      return;
    }

    const inventoryComponent = player.inventory;
    if (inventoryComponent) {
      inventoryComponent.addGold(amount);
    }
  }

  /**
   * @pattern Facade
   * @description Remove gold from player
   */
  public removeGoldFromPlayer(player: Player, amount: number): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    return inventoryComponent.removeGold(amount);
  }

  /**
   * @pattern Facade
   * @description Get player gold
   */
  public getPlayerGold(player: Player): number {
    const inventoryComponent = player.inventory;
    return inventoryComponent ? inventoryComponent.gold : 0;
  }

  /**
   * @pattern Facade
   * @description Check if player inventory is full
   */
  public isPlayerInventoryFull(player: Player): boolean {
    const inventoryComponent = player.inventory;
    return inventoryComponent ? inventoryComponent.isFull : true;
  }

  /**
   * @pattern Facade
   * @description Get player inventory capacity
   */
  public getPlayerInventoryCapacity(player: Player): { current: number; max: number } {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return { current: 0, max: 0 };
    }

    return {
      current: inventoryComponent.currentCapacity,
      max: inventoryComponent.maxCapacity
    };
  }

  /**
   * @pattern Facade
   * @description Use consumable item
   */
  public useConsumableItem(player: Player, itemId: string): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    const itemInstance = inventoryComponent.findItemByItemId(itemId);
    if (!itemInstance || itemInstance.item.type !== 'consumable') {
      return false;
    }

    // Remove one item
    const success = inventoryComponent.removeItemById(itemId, 1);
    if (success) {
      // Apply consumable effect based on item type
      this.applyConsumableEffect(player, itemInstance);
    }

    return success;
  }

  /**
   * @pattern Facade
   * @description Apply consumable item effects
   */
  private applyConsumableEffect(player: Player, itemInstance: ItemInstance): void {
    const itemId = itemInstance.item.id;
    
    switch (itemId) {
      case 'potion_health':
        // Restore health (would need health component)
        this.eventBus.emit('player:health_restored', {
          player: player,
          amount: 50,
          source: 'health_potion'
        });
        break;
      
      case 'potion_mana':
        // Restore mana (would need mana component)
        this.eventBus.emit('player:mana_restored', {
          player: player,
          amount: 50,
          source: 'mana_potion'
        });
        break;
      
      default:
        // Generic consumable effect
        this.eventBus.emit('player:consumable_used', {
          player: player,
          item: itemInstance
        });
        break;
    }
  }

  /**
   * @pattern Facade
   * @description Equip item to player
   */
  public equipItem(player: Player, itemId: string): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return false;
    }

    const itemInstance = inventoryComponent.findItemByItemId(itemId);
    if (!itemInstance || itemInstance.item.slot === 'none') {
      return false;
    }

    // Check if player can equip this item type
    if (!this.canPlayerEquipItem(player, itemInstance)) {
      return false;
    }

    // Emit equip event
    this.eventBus.emit('player:item_equipped', {
      player: player,
      item: itemInstance,
      slot: itemInstance.item.slot
    });

    return true;
  }

  /**
   * @pattern Facade
   * @description Check if player can equip item
   */
  private canPlayerEquipItem(player: Player, itemInstance: ItemInstance): boolean {
    // Basic checks - could be enhanced with character class restrictions
    const itemType = itemInstance.item.type;
    const characterClass = player.characterClass;

    // Warriors can equip weapons and armor
    if (characterClass.type === 'warrior') {
      return itemType === 'weapon' || itemType === 'armor';
    }

    // Wizards can equip weapons and armor (but prefer staves)
    if (characterClass.type === 'wizard') {
      return itemType === 'weapon' || itemType === 'armor';
    }

    // Rogues can equip weapons and armor
    if (characterClass.type === 'rogue') {
      return itemType === 'weapon' || itemType === 'armor';
    }

    return false;
  }

  /**
   * @pattern Facade
   * @description Enable or disable inventory service
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * @pattern Facade
   * @description Check if inventory service is enabled
   */
  public isInventoryEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * @pattern Facade
   * @description Add inventory event callback
   */
  public onInventoryEvent(
    eventType: string, 
    callback: (event: InventoryEvent) => void,
    entityId?: string
  ): void {
    const key = entityId ? `${entityId}_${eventType}` : eventType;
    this.inventoryCallbacks.set(key, callback);
  }

  /**
   * @pattern Facade
   * @description Remove inventory event callback
   */
  public removeInventoryCallback(eventType: string, entityId?: string): void {
    const key = entityId ? `${entityId}_${eventType}` : eventType;
    this.inventoryCallbacks.delete(key);
  }

  /**
   * @pattern Facade
   * @description Get inventory statistics for player
   */
  public getPlayerInventoryStats(player: Player): {
    totalItems: number;
    totalGold: number;
    capacity: { current: number; max: number };
    itemTypes: { [key: string]: number };
    totalValue: number;
  } {
    const inventoryComponent = player.inventory;
    if (!inventoryComponent) {
      return {
        totalItems: 0,
        totalGold: 0,
        capacity: { current: 0, max: 0 },
        itemTypes: {},
        totalValue: 0
      };
    }

    const items = Array.from(inventoryComponent.newItems.values());
    const itemTypes: { [key: string]: number } = {};
    let totalValue = 0;

    for (const item of items) {
      const type = item.item.type;
      itemTypes[type] = (itemTypes[type] || 0) + item.quantity;
      totalValue += item.item.value * item.quantity;
    }

    return {
      totalItems: inventoryComponent.getTotalItemCount(),
      totalGold: inventoryComponent.gold,
      capacity: {
        current: inventoryComponent.currentCapacity,
        max: inventoryComponent.maxCapacity
      },
      itemTypes,
      totalValue
    };
  }
}


