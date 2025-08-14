# 🎮 Isometric RPG Game

A modern, architecturally-sound isometric RPG game built with TypeScript, Vite, and Phaser3, implementing comprehensive GoF design patterns and ECS architecture.

## ✨ Features

### 🎯 **MVP Core Features (COMPLETE ✅)**
- **C1** - Player Entity Creation (Builder Pattern)
- **C2** - Map Tilemap System (AbstractFactory + Composite + Flyweight)
- **C3** - Hero Sprite Generation (AI Pipeline)
- **C4** - Movement Command System (Command + Chain of Responsibility)
- **C5** - Walk Cycle Animation (Observer Pattern ECS)
- **C6** - Inventory System (Decorator + Observer)
- **C7** - Save/Load System (Memento Pattern)
- **C8** - Comprehensive E2E Testing (Playwright)

### 🏗️ **Architecture Highlights**
- **Entity-Component-System (ECS)** architecture for flexible game logic
- **GoF Design Patterns** throughout for maintainable, scalable code
- **Layered Architecture** with clear separation of concerns
- **Event-driven communication** between systems
- **TypeScript** for type safety and developer experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd isorpg

# Install dependencies
npm install

# Install Playwright browsers (for testing)
npx playwright install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run end-to-end tests (Playwright)
npm run assets       # Generate AI assets
```

## 🏗️ Project Structure

```
isorpg/
├── .ai/                     # AI project management
│   ├── INSTRUCTIONS.md     # Project constraints & rules
│   ├── UNDONE.md          # Kanban task tracking
│   └── features/          # Gherkin specifications
├── build/                  # Build tools
│   └── generateAssets.ts  # AI asset generation
├── e2e/                   # End-to-end tests
│   ├── features/          # Gherkin feature files
│   ├── game-features.spec.ts
│   └── test-runner.ts
├── src/                    # Source code
│   ├── domain/            # Domain layer
│   │   ├── entity/        # Game entities
│   │   ├── service/       # Domain services
│   │   ├── system/        # ECS systems
│   │   └── valueObject/   # Value objects
│   ├── gameKernel/        # ECS kernel
│   ├── patterns/          # GoF design patterns
│   │   ├── behavioral/    # Command, Observer, etc.
│   │   ├── creational/    # Builder, Factory, etc.
│   │   └── structural/    # Composite, Decorator, etc.
│   └── tests/             # Unit tests
├── www/                   # Web assets
└── package.json           # Dependencies & scripts
```

## 🎨 Design Patterns Implemented

### **Creational Patterns**
- **Singleton** - GameKernel, EventBus, SpriteManager
- **Builder** - PlayerBuilder for flexible character creation
- **Factory Method** - ItemFactory, TileFactory
- **Abstract Factory** - TileFactoryFactory for themed tiles

### **Structural Patterns**
- **Composite** - MapComposite for hierarchical map structure
- **Decorator** - ItemDecorator for item enhancements
- **Facade** - SaveLoadManager, MovementService
- **Flyweight** - TileFlyweight for memory optimization

### **Behavioral Patterns**
- **Command** - MovementCommand for undoable operations
- **Chain of Responsibility** - InputHandler chain
- **Observer** - EventBus for system communication
- **Memento** - GameMemento for save/load functionality
- **Template Method** - Application bootstrap sequence

## 🧪 Testing Strategy

### **Unit Tests (Vitest)**
- Pattern implementation validation
- Component functionality testing
- Service behavior verification

### **Integration Tests**
- ECS system coordination
- Service interaction testing
- Event flow validation

### **End-to-End Tests (Playwright)**
- Complete game workflows
- Cross-browser compatibility
- Performance validation
- Error handling scenarios

## 🎮 Game Systems

### **Player System**
- Character creation with Builder pattern
- Component-based architecture (Position, Sprite, Inventory, Animation)
- Multiple character classes (Wizard, Warrior, Rogue, Cleric)

### **Map System**
- Isometric tile-based maps
- Theme-based generation (Forest, Desert, etc.)
- Walkable tile validation and pathfinding

### **Movement System**
- WASD/Arrow key input handling
- Command pattern for undoable movement
- Collision detection and validation

### **Animation System**
- 4-directional walk cycles
- Event-driven animation state management
- Smooth transitions between states

### **Inventory System**
- Item collection and management
- Decorator pattern for item enhancements
- Gold and currency management

### **Save/Load System**
- Game state persistence (localStorage/IndexedDB)
- Auto-save functionality
- Multiple save slots and management

## 🔧 Development

### **Code Quality Standards**
- **No global mutable state** (except World ECS)
- **No cyclic dependencies**
- **JSDoc pattern tagging** for all classes
- **Strict TypeScript** configuration
- **Comprehensive error handling**

### **ECS Architecture**
```typescript
// Entity with components
const player = new Entity();
player.addComponent(new PositionComponent(0, 0, 0));
player.addComponent(new SpriteComponent('player_sprite'));
player.addComponent(new InventoryComponent(10));

// Systems process entities
class MovementSystem extends System {
  update(deltaTime: number) {
    // Process all entities with PositionComponent
  }
}
```

### **Event-Driven Communication**
```typescript
// Subscribe to events
eventBus.on('player:moved', (event) => {
  // Handle player movement
});

// Emit events
eventBus.emit('player:moved', { x: 5, y: 5, z: 0 });
```

## 🚀 Deployment

### **Build Process**
```bash
# Production build
npm run build

# Preview build
npm run preview
```

### **Environment Configuration**
- Development: `http://localhost:5173`
- Production: Configure in `vite.config.ts`

## 📚 Documentation

- **API Documentation**: See JSDoc comments in source code
- **Pattern Usage**: Each class is tagged with `@pattern`
- **Architecture**: See `.ai/INSTRUCTIONS.md` for constraints
- **Testing**: See `e2e/README.md` for testing guide

## 🤝 Contributing

1. Follow the architectural constraints in `.ai/INSTRUCTIONS.md`
2. Implement GoF design patterns where appropriate
3. Add comprehensive tests for new features
4. Update documentation and task tracking

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- **Phaser3** for the game engine
- **Vite** for the build tooling
- **TypeScript** for type safety
- **GoF Design Patterns** for architectural guidance
- **ECS Architecture** for scalable game logic

---

**Status**: 🎯 **MVP COMPLETE** - All core features implemented and tested!

Ready for player use and further development! 🎮✨

