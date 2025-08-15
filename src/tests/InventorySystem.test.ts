/**
 * @pattern Test
 * @description Unit tests for inventory system with Decorator pattern and Observer pattern integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '@domain/entity/Player';
import { CharacterClass, CharacterClassFactory } from '@domain/valueObject/CharacterClass';
import { PositionComponent } from '@domain/entity/components/PositionComponent';
import { SpriteComponent } from '@domain/entity/components/SpriteComponent';
import { AnimationComponent } from '@domain/entity/components/AnimationComponent';
import { InventoryComponent } from '@domain/entity/components/InventoryComponent';
import { Item, ItemFactory, ItemInstance } from '@domain/valueObject/Item';
import { 
  IItemDecorator, 
  EnchantedItemDecorator, 
  DurableItemDecorator, 
  MasterworkItemDecorator, 
  LegendaryItemDecorator,
  ItemDecoratorFactory 
} from '@patterns/structural/Decorator/ItemDecorator';
import { InventoryService } from '@domain/service/InventoryService';
import { EventBus } from '@gameKernel/Kernel';

describe('Inventory System', () => {
  let player: Player;
  let inventoryComponent: InventoryComponent;
  let inventoryService: InventoryService;
  let eventBus: EventBus;

  beforeEach(() => {
    // Create player with components
    const characterClass = CharacterClassFactory.fromType('WARRIOR');
    const positionComponent = new PositionComponent();
    const spriteComponent = new SpriteComponent();
    const animationComponent = new AnimationComponent();
    const inventoryComponent = new InventoryComponent(20);

    player = new Player(
      'test-player',
      'TestPlayer',
      characterClass,
      positionComponent,
      spriteComponent,
      animationComponent,
      inventoryComponent
    );

    inventoryService = new InventoryService();
    eventBus = EventBus.getInstance();
  });

  describe('Item System', () => {
    it('should create items with factory', () => {
      const sword = ItemFactory.getItem('sword_iron');
      const potion = ItemFactory.getItem('potion_health');
      
      expect(sword).toBeDefined();
      expect(sword?.name).toBe('Iron Sword');
      expect(sword?.type).toBe('weapon');
      
      expect(potion).toBeDefined();
      expect(potion?.name).toBe('Health Potion');
      expect(potion?.type).toBe('consumable');
    });

    it('should create item instances', () => {
      const sword = ItemFactory.getItem('sword_iron');
      expect(sword).toBeDefined();
      
      const instance = sword!.createInstance(1);
      expect(instance.item).toBe(sword);
      expect(instance.quantity).toBe(1);
      expect(instance.uniqueId).toBeDefined();
    });

    it('should get items by type', () => {
      const weapons = ItemFactory.getItemsByType('weapon');
      const consumables = ItemFactory.getItemsByType('consumable');
      
      expect(weapons.length).toBeGreaterThan(0);
      expect(consumables.length).toBeGreaterThan(0);
      
      weapons.forEach(weapon => expect(weapon.type).toBe('weapon'));
      consumables.forEach(consumable => expect(consumable.type).toBe('consumable'));
    });

    it('should get items by rarity', () => {
      const common = ItemFactory.getItemsByRarity('common');
      const rare = ItemFactory.getItemsByRarity('rare');
      
      expect(common.length).toBeGreaterThan(0);
      expect(rare.length).toBeGreaterThan(0);
      
      common.forEach(item => expect(item.rarity).toBe('common'));
      rare.forEach(item => expect(item.rarity).toBe('rare'));
    });
  });

  describe('Item Decorators', () => {
    let baseSword: Item;

    beforeEach(() => {
      baseSword = ItemFactory.getItem('sword_iron')!;
    });

    it('should create enchanted item', () => {
      const enchantedSword = new EnchantedItemDecorator(baseSword, 'fire', 3);
      
      expect(enchantedSword.getDisplayName()).toContain('Flaming');
      expect(enchantedSword.isEnchanted()).toBe(true);
      expect(enchantedSword.getEnchantmentLevel()).toBe(3);
      expect(enchantedSword.getValue()).toBeGreaterThan(baseSword.value);
    });

    it('should create durable item', () => {
      const durableSword = new DurableItemDecorator(baseSword, 150);
      
      expect(durableSword.getDurability()).toBe(150);
      expect(durableSword.getMaxDurability()).toBe(150);
      expect(durableSword.isDamaged()).toBe(false);
      
      durableSword.reduceDurability(50);
      expect(durableSword.getDurability()).toBe(100);
      expect(durableSword.isDamaged()).toBe(true);
      expect(durableSword.getValue()).toBeLessThan(baseSword.value);
    });

    it('should create masterwork item', () => {
      const masterworkSword = new MasterworkItemDecorator(baseSword);
      
      expect(masterworkSword.getDisplayName()).toContain('Masterwork');
      expect(masterworkSword.getValue()).toBeGreaterThan(baseSword.value);
      expect(masterworkSword.getWeight()).toBeLessThan(baseSword.weight);
    });

    it('should create legendary item', () => {
      const legendarySword = new LegendaryItemDecorator(baseSword, 'Dragon Slayer');
      
      expect(legendarySword.getDisplayName()).toContain('Legendary');
      expect(legendarySword.getValue()).toBe(baseSword.value * 5);
      expect(legendarySword.getWeight()).toBe(baseSword.weight * 0.5);
    });

    it('should create enhanced item with multiple decorators', () => {
      const enhancedSword = ItemDecoratorFactory.createEnhancedItem(baseSword, {
        enchantment: { type: 'fire', level: 5 },
        durability: 200,
        masterwork: true
      });
      
      expect(enhancedSword.getDisplayName()).toContain('Masterwork');
      expect(enhancedSword.isEnchanted()).toBe(true);
      expect(enhancedSword.getDurability()).toBe(200);
    });
  });

  describe('Inventory Component', () => {
    beforeEach(() => {
      inventoryComponent = new InventoryComponent(10);
    });

    it('should add items to inventory', () => {
      const success = inventoryComponent.addItemById('potion_health', 5);
      expect(success).toBe(true);
      expect(inventoryComponent.currentCapacity).toBe(1);
    });

    it('should stack stackable items', () => {
      inventoryComponent.addItemById('potion_health', 3);
      inventoryComponent.addItemById('potion_health', 2);
      
      const item = inventoryComponent.findItemByItemId('potion_health');
      expect(item?.quantity).toBe(5);
    });

    it('should not stack non-stackable items', () => {
      inventoryComponent.addItemById('sword_iron', 1);
      inventoryComponent.addItemById('sword_iron', 1);
      
      const items = Array.from(inventoryComponent.newItems.values());
      expect(items.length).toBe(2);
    });

    it('should remove items from inventory', () => {
      inventoryComponent.addItemById('potion_health', 5);
      const success = inventoryComponent.removeItemById('potion_health', 2);
      
      expect(success).toBe(true);
      const item = inventoryComponent.findItemByItemId('potion_health');
      expect(item?.quantity).toBe(3);
    });

    it('should handle inventory capacity', () => {
      // Fill inventory
      for (let i = 0; i < 10; i++) {
        inventoryComponent.addItemById('potion_health', 1);
      }
      
      expect(inventoryComponent.isFull).toBe(true);
      
      const success = inventoryComponent.addItemById('sword_iron', 1);
      expect(success).toBe(false);
    });

    it('should manage gold', () => {
      inventoryComponent.addGold(100);
      expect(inventoryComponent.gold).toBe(100);
      
      const success = inventoryComponent.removeGold(50);
      expect(success).toBe(true);
      expect(inventoryComponent.gold).toBe(50);
      
      const fail = inventoryComponent.removeGold(100);
      expect(fail).toBe(false);
      expect(inventoryComponent.gold).toBe(50);
    });
  });

  describe('Inventory Service', () => {
    it('should add items to player', () => {
      const success = inventoryService.addItemToPlayer(player, 'potion_health', 3);
      expect(success).toBe(true);
      expect(inventoryService.playerHasItem(player, 'potion_health', 3)).toBe(true);
    });

    it('should add enhanced items to player', () => {
      const success = inventoryService.addEnhancedItemToPlayer(
        player, 
        'sword_iron', 
        { enchantment: { type: 'fire', level: 3 } }
      );
      
      expect(success).toBe(true);
      const item = inventoryService.getPlayerItem(player, 'sword_iron');
      expect(item).toBeDefined();
    });

    it('should remove items from player', () => {
      inventoryService.addItemToPlayer(player, 'potion_health', 5);
      const success = inventoryService.removeItemFromPlayer(player, 'potion_health', 2);
      
      expect(success).toBe(true);
      expect(inventoryService.playerHasItem(player, 'potion_health', 3)).toBe(true);
    });

    it('should manage player gold', () => {
      inventoryService.addGoldToPlayer(player, 200);
      expect(inventoryService.getPlayerGold(player)).toBe(200);
      
      const success = inventoryService.removeGoldFromPlayer(player, 50);
      expect(success).toBe(true);
      expect(inventoryService.getPlayerGold(player)).toBe(150);
    });

    it('should check inventory capacity', () => {
      const capacity = inventoryService.getPlayerInventoryCapacity(player);
      expect(capacity.current).toBe(0);
      expect(capacity.max).toBe(20);
      expect(inventoryService.isPlayerInventoryFull(player)).toBe(false);
    });

    it('should use consumable items', () => {
      inventoryService.addItemToPlayer(player, 'potion_health', 1);
      const success = inventoryService.useConsumableItem(player, 'potion_health');
      
      expect(success).toBe(true);
      expect(inventoryService.playerHasItem(player, 'potion_health', 1)).toBe(false);
    });

    it('should equip items', () => {
      inventoryService.addItemToPlayer(player, 'sword_iron', 1);
      const success = inventoryService.equipItem(player, 'sword_iron');
      
      expect(success).toBe(true);
    });

    it('should get inventory statistics', () => {
      inventoryService.addItemToPlayer(player, 'potion_health', 3);
      inventoryService.addItemToPlayer(player, 'sword_iron', 1);
      inventoryService.addGoldToPlayer(player, 100);
      
      const stats = inventoryService.getPlayerInventoryStats(player);
      
      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.totalGold).toBe(100);
      expect(stats.capacity.current).toBe(2);
      expect(stats.itemTypes.consumable).toBe(3);
      expect(stats.itemTypes.weapon).toBe(1);
      expect(stats.totalValue).toBeGreaterThan(0);
    });
  });

  describe('Inventory Events', () => {
    it('should emit item added events', () => {
      const callback = vi.fn();
      eventBus.on('inventory:event', callback);
      
      inventoryService.addItemToPlayer(player, 'potion_health', 2);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'item_added',
          message: expect.stringContaining('Added 2 Health Potion')
        })
      );
    });

    it('should emit item removed events', () => {
      inventoryService.addItemToPlayer(player, 'potion_health', 3);
      
      const callback = vi.fn();
      eventBus.on('inventory:event', callback);
      
      inventoryService.removeItemFromPlayer(player, 'potion_health', 1);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'item_removed',
          message: expect.stringContaining('Removed 1 Health Potion')
        })
      );
    });

    it('should emit gold changed events', () => {
      const callback = vi.fn();
      eventBus.on('inventory:event', callback);
      
      inventoryService.addGoldToPlayer(player, 50);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'gold_changed',
          message: 'Added 50 gold',
          gold: 50
        })
      );
    });

    it('should handle inventory event callbacks', () => {
      const callback = vi.fn();
      inventoryService.onInventoryEvent('item_added', callback);
      
      inventoryService.addItemToPlayer(player, 'potion_health', 1);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Item Decorator Integration', () => {
    it('should create and use enhanced items', () => {
      const baseSword = ItemFactory.getItem('sword_iron')!;
      const enhancedSword = ItemDecoratorFactory.createEnhancedItem(baseSword, {
        enchantment: { type: 'fire', level: 5 },
        durability: 200,
        masterwork: true
      });
      
      expect(enhancedSword.getDisplayName()).toContain('Masterwork');
      expect(enhancedSword.getDisplayName()).toContain('Flaming');
      expect(enhancedSword.isEnchanted()).toBe(true);
      expect(enhancedSword.getDurability()).toBe(200);
      expect(enhancedSword.getValue()).toBeGreaterThan(baseSword.value);
    });

    it('should handle durability changes', () => {
      const baseSword = ItemFactory.getItem('sword_iron')!;
      const durableSword = new DurableItemDecorator(baseSword, 100);
      
      expect(durableSword.getDurability()).toBe(100);
      expect(durableSword.isDamaged()).toBe(false);
      
      durableSword.reduceDurability(30);
      expect(durableSword.getDurability()).toBe(70);
      expect(durableSword.isDamaged()).toBe(true);
      
      durableSword.repair(20);
      expect(durableSword.getDurability()).toBe(90);
      
      durableSword.fullRepair();
      expect(durableSword.getDurability()).toBe(100);
      expect(durableSword.isDamaged()).toBe(false);
    });

    it('should calculate enhanced item values', () => {
      const baseSword = ItemFactory.getItem('sword_iron')!;
      const enchantedSword = new EnchantedItemDecorator(baseSword, 'fire', 3);
      const masterworkSword = new MasterworkItemDecorator(baseSword);
      const legendarySword = new LegendaryItemDecorator(baseSword, 'Dragon Slayer');
      
      expect(enchantedSword.getValue()).toBeGreaterThan(baseSword.value);
      expect(masterworkSword.getValue()).toBeGreaterThan(baseSword.value);
      expect(legendarySword.getValue()).toBe(baseSword.value * 5);
    });
  });
});


