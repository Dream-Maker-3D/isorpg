/**
 * @pattern Component
 * @description Inventory component for ECS entities
 */

import { Component } from '@gameKernel/Kernel';
import { ItemInstance, ItemFactory } from '@domain/valueObject/Item';
import { IItemDecorator } from '@patterns/structural/Decorator/ItemDecorator';
import { EventBus } from '@gameKernel/Kernel';

/**
 * @pattern Value Object
 * @description Item interface for inventory management (legacy support)
 */
export interface InventoryItem {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly quantity: number;
  readonly maxStack: number;
}

/**
 * @pattern Observer
 * @description Inventory event data
 */
export interface InventoryEvent {
  entityId: string;
  eventType: 'item_added' | 'item_removed' | 'item_used' | 'gold_changed' | 'capacity_changed';
  item?: ItemInstance;
  quantity?: number;
  gold?: number;
  capacity?: number;
  message: string;
}

/**
 * @pattern Component
 * @description Handles entity inventory and item collection
 */
export class InventoryComponent extends Component {
  public readonly type = 'Inventory';
  
  private _items: Map<string, InventoryItem> = new Map();
  private _newItems: Map<string, ItemInstance> = new Map(); // New item system
  private _maxCapacity: number;
  private _gold: number;
  private _eventBus: EventBus;

  constructor(maxCapacity: number = 20) {
    super();
    this._maxCapacity = maxCapacity;
    this._gold = 0;
    this._eventBus = EventBus.getInstance();
  }

  public get items(): ReadonlyMap<string, InventoryItem> {
    return this._items;
  }

  public get newItems(): ReadonlyMap<string, ItemInstance> {
    return this._newItems;
  }

  public get maxCapacity(): number {
    return this._maxCapacity;
  }

  public get currentCapacity(): number {
    return this._items.size + this._newItems.size;
  }

  public get gold(): number {
    return this._gold;
  }

  public get isFull(): boolean {
    return this.currentCapacity >= this._maxCapacity;
  }

  public addItem(item: InventoryItem): boolean {
    if (this.isFull && !this._items.has(item.id)) {
      return false; // Inventory full
    }

    const existingItem = this._items.get(item.id);
    if (existingItem) {
      // Stack items if possible
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity <= existingItem.maxStack) {
        this._items.set(item.id, {
          ...existingItem,
          quantity: newQuantity
        });
        return true;
      }
    } else {
      // Add new item
      this._items.set(item.id, item);
      return true;
    }

    return false;
  }

  /**
   * @pattern Observer
   * @description Add item using new item system
   */
  public addItemInstance(itemInstance: ItemInstance): boolean {
    if (this.isFull && !this._newItems.has(itemInstance.uniqueId)) {
      this.emitInventoryEvent('item_added', {
        message: 'Inventory is full',
        item: itemInstance
      });
      return false;
    }

    // Check if we can stack with existing item
    const existingItem = this.findItemByItemId(itemInstance.item.id);
    if (existingItem && itemInstance.item.stackable) {
      const newQuantity = existingItem.quantity + itemInstance.quantity;
      if (newQuantity <= itemInstance.item.maxStack) {
        // Update existing stack
        this.updateItemQuantity(existingItem.uniqueId, newQuantity);
        this.emitInventoryEvent('item_added', {
          message: `Added ${itemInstance.quantity} ${itemInstance.item.name} to existing stack`,
          item: existingItem,
          quantity: itemInstance.quantity
        });
        return true;
      }
    }

    // Add as new item
    this._newItems.set(itemInstance.uniqueId, itemInstance);
    this.emitInventoryEvent('item_added', {
      message: `Added ${itemInstance.quantity} ${itemInstance.item.name}`,
      item: itemInstance,
      quantity: itemInstance.quantity
    });
    return true;
  }

  /**
   * @pattern Observer
   * @description Add item by ID using factory
   */
  public addItemById(itemId: string, quantity: number = 1): boolean {
    const itemInstance = ItemFactory.createItemInstance(itemId, quantity);
    if (!itemInstance) {
      this.emitInventoryEvent('item_added', {
        message: `Failed to create item: ${itemId}`,
        quantity: quantity
      });
      return false;
    }
    return this.addItemInstance(itemInstance);
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this._items.get(itemId);
    if (!item) {
      return false;
    }

    if (item.quantity <= quantity) {
      // Remove entire stack
      this._items.delete(itemId);
    } else {
      // Reduce quantity
      this._items.set(itemId, {
        ...item,
        quantity: item.quantity - quantity
      });
    }

    return true;
  }

  /**
   * @pattern Observer
   * @description Remove item instance by unique ID
   */
  public removeItemInstance(uniqueId: string, quantity: number = 1): boolean {
    const itemInstance = this._newItems.get(uniqueId);
    if (!itemInstance) {
      return false;
    }

    if (itemInstance.quantity <= quantity) {
      // Remove entire stack
      this._newItems.delete(uniqueId);
      this.emitInventoryEvent('item_removed', {
        message: `Removed all ${itemInstance.item.name}`,
        item: itemInstance,
        quantity: itemInstance.quantity
      });
    } else {
      // Reduce quantity
      const newQuantity = itemInstance.quantity - quantity;
      this.updateItemQuantity(uniqueId, newQuantity);
      this.emitInventoryEvent('item_removed', {
        message: `Removed ${quantity} ${itemInstance.item.name}`,
        item: itemInstance,
        quantity: quantity
      });
    }

    return true;
  }

  /**
   * @pattern Observer
   * @description Remove item by item ID (from any stack)
   */
  public removeItemById(itemId: string, quantity: number = 1): boolean {
    const itemInstance = this.findItemByItemId(itemId);
    if (!itemInstance) {
      return false;
    }

    return this.removeItemInstance(itemInstance.uniqueId, quantity);
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this._items.get(itemId);
    return item ? item.quantity >= quantity : false;
  }

  public getItem(itemId: string): InventoryItem | undefined {
    return this._items.get(itemId);
  }

  public addGold(amount: number): void {
    const oldGold = this._gold;
    this._gold += Math.max(0, amount);
    this.emitInventoryEvent('gold_changed', {
      message: `Added ${amount} gold`,
      gold: this._gold
    });
  }

  public removeGold(amount: number): boolean {
    if (this._gold >= amount) {
      this._gold -= amount;
      this.emitInventoryEvent('gold_changed', {
        message: `Removed ${amount} gold`,
        gold: this._gold
      });
      return true;
    }
    return false;
  }

  public clear(): void {
    this._items.clear();
    this._gold = 0;
  }

  public getItemCount(): number {
    return this._items.size;
  }

  public getTotalItemCount(): number {
    let total = 0;
    for (const item of this._items.values()) {
      total += item.quantity;
    }
    return total;
  }

  public toString(): string {
    return `Inventory(${this._items.size}/${this._maxCapacity} items, ${this._gold} gold)`;
  }

  /**
   * @pattern Observer
   * @description Find item instance by item ID
   */
  private findItemByItemId(itemId: string): ItemInstance | null {
    for (const itemInstance of this._newItems.values()) {
      if (itemInstance.item.id === itemId) {
        return itemInstance;
      }
    }
    return null;
  }

  /**
   * @pattern Observer
   * @description Emit inventory event
   */
  private emitInventoryEvent(eventType: InventoryEvent['eventType'], data: Partial<InventoryEvent>): void {
    const event: InventoryEvent = {
      entityId: this.entityId,
      eventType,
      message: data.message || '',
      ...data
    };
    this._eventBus.emit('inventory:event', event);
  }

  /**
   * @pattern Observer
   * @description Update item quantity (creates new instance to avoid readonly issues)
   */
  private updateItemQuantity(uniqueId: string, newQuantity: number): void {
    const itemInstance = this._newItems.get(uniqueId);
    if (!itemInstance) return;

    if (newQuantity <= 0) {
      this._newItems.delete(uniqueId);
    } else {
      // Create new instance with updated quantity
      const updatedInstance: ItemInstance = {
        ...itemInstance,
        quantity: newQuantity
      };
      this._newItems.set(uniqueId, updatedInstance);
    }
  }
}
