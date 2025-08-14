/**
 * @pattern Test
 * @description Unit tests for Map system with Flyweight, Composite, and Abstract Factory patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Map } from '@domain/entity/Map';
import { TileType } from '@domain/valueObject/TileType';
import { TileFlyweightFactory } from '@patterns/structural/Flyweight/TileFlyweight';
import { TileFactoryFactory } from '@patterns/creational/AbstractFactory/TileFactory';

describe('Map System', () => {
  let map: Map;

  beforeEach(() => {
    // Clear flyweights before each test
    TileFlyweightFactory.clear();
    map = new Map('TestMap', 10, 10, 'standard');
  });

  describe('Map Creation', () => {
    it('should create a map with correct dimensions', () => {
      expect(map.width).toBe(10);
      expect(map.height).toBe(10);
      expect(map.name).toBe('TestMap');
    });

    it('should preload all tile flyweights', () => {
      expect(TileFlyweightFactory.getFlyweightCount()).toBeGreaterThan(0);
    });
  });

  describe('Tile Factory', () => {
    it('should create different factories for different themes', () => {
      const standardFactory = TileFactoryFactory.createFactory('standard');
      const forestFactory = TileFactoryFactory.createFactory('forest');
      const desertFactory = TileFactoryFactory.createFactory('desert');

      expect(standardFactory).toBeDefined();
      expect(forestFactory).toBeDefined();
      expect(desertFactory).toBeDefined();
    });

    it('should create tiles with correct properties', () => {
      const tile = map.getTile(0, 0);
      expect(tile).toBeNull(); // No tiles set initially

      map.setTileAt(0, 0, TileType.GRASS);
      const grassTile = map.getTile(0, 0);
      expect(grassTile).toBeDefined();
      expect(grassTile?.type).toBe(TileType.GRASS);
      expect(grassTile?.isWalkable()).toBe(true);
    });
  });

  describe('Map Generation', () => {
    it('should generate a random map', () => {
      map.generateRandomMap();
      
      const stats = map.getMapStats();
      expect(stats.totalTiles).toBe(100); // 10x10
      expect(stats.walkableTiles).toBeGreaterThan(0);
      expect(stats.flyweightCount).toBeGreaterThan(0);
    });

    it('should have walkable positions after generation', () => {
      map.generateRandomMap();
      
      const walkablePositions = map.getWalkablePositions();
      expect(walkablePositions.length).toBeGreaterThan(0);
    });

    it('should get random walkable position', () => {
      map.generateRandomMap();
      
      const randomPos = map.getRandomWalkablePosition();
      expect(randomPos).toBeDefined();
      expect(randomPos?.x).toBeGreaterThanOrEqual(0);
      expect(randomPos?.y).toBeGreaterThanOrEqual(0);
      expect(randomPos?.x).toBeLessThan(10);
      expect(randomPos?.y).toBeLessThan(10);
    });
  });

  describe('Map Operations', () => {
    beforeEach(() => {
      map.generateRandomMap();
    });

    it('should check if position is walkable', () => {
      const walkablePositions = map.getWalkablePositions();
      if (walkablePositions.length > 0) {
        const pos = walkablePositions[0];
        expect(map.isWalkable(pos.x, pos.y)).toBe(true);
      }
    });

    it('should get movement cost for position', () => {
      map.setTileAt(0, 0, TileType.GRASS);
      expect(map.getMovementCost(0, 0)).toBe(1);

      map.setTileAt(1, 1, TileType.STONE);
      expect(map.getMovementCost(1, 1)).toBe(2);
    });

    it('should get elevation for position', () => {
      map.setTileAt(0, 0, TileType.GRASS);
      expect(map.getElevation(0, 0)).toBe(0);

      map.setTileAt(1, 1, TileType.FOREST);
      expect(map.getElevation(1, 1)).toBe(1);
    });
  });

  describe('Composite Pattern', () => {
    it('should create layers and regions', () => {
      const layer = map.createLayer('test-layer', 1);
      expect(layer.name).toBe('test-layer');
      expect(layer.layerId).toBe(1);

      const region = map.createRegion('test-region', 'forest', 0, 0, 5, 5);
      expect(region.name).toBe('test-region');
      expect(region.regionType).toBe('forest');
    });

    it('should render map components', () => {
      map.generateRandomMap();
      
      // Should not throw
      expect(() => map.render()).not.toThrow();
    });
  });

  describe('Flyweight Pattern', () => {
    it('should reuse flyweights for same tile types', () => {
      const initialCount = TileFlyweightFactory.getFlyweightCount();
      
      map.setTileAt(0, 0, TileType.GRASS);
      map.setTileAt(1, 1, TileType.GRASS);
      map.setTileAt(2, 2, TileType.GRASS);
      
      const finalCount = TileFlyweightFactory.getFlyweightCount();
      expect(finalCount).toBe(initialCount + 1); // Only one new flyweight for GRASS
    });

    it('should have different flyweights for different tile types', () => {
      const initialCount = TileFlyweightFactory.getFlyweightCount();
      
      map.setTileAt(0, 0, TileType.GRASS);
      map.setTileAt(1, 1, TileType.WATER);
      map.setTileAt(2, 2, TileType.MOUNTAIN);
      
      const finalCount = TileFlyweightFactory.getFlyweightCount();
      expect(finalCount).toBe(initialCount + 3); // Three new flyweights
    });
  });
});

