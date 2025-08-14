Feature: Isometric RPG Game Play
  As a player
  I want to experience a complete RPG game session
  So that I can enjoy all the implemented features

  Background:
    Given the game is loaded and running
    And the save/load system is initialized
    And I have created a character

  @smoke @core
  Scenario: Complete Game Session
    Given I am playing as a wizard character
    When I move around the map
    And I collect items for my inventory
    And I save my game progress
    Then my game state should be preserved
    And I should be able to load my saved game
    And all my progress should be restored

  @movement @core
  Scenario: Player Movement on Isometric Map
    Given I am positioned at coordinates (5, 5, 0)
    When I press the "W" key
    Then I should move north
    And my position should update to (5, 4, 0)
    When I press the "S" key
    Then I should move south
    And my position should return to (5, 5, 0)
    When I press the "A" key
    Then I should move west
    And my position should update to (4, 5, 0)
    When I press the "D" key
    Then I should move east
    And my position should return to (5, 5, 0)

  @animation @core
  Scenario: Walk Cycle Animation
    Given I am standing still
    When I start moving in any direction
    Then my character should play a walk animation
    And the animation should loop continuously
    When I stop moving
    Then my character should return to idle animation

  @inventory @core
  Scenario: Item Collection and Management
    Given I have an empty inventory
    When I collect a sword item
    Then my inventory should contain 1 sword
    And my inventory capacity should be 1
    When I collect a potion item
    Then my inventory should contain 2 items
    And my inventory capacity should be 2
    When I collect an enchanted item
    Then the item should have enhancement properties
    And the item should be properly decorated

  @save-load @core
  Scenario: Game Save and Load
    Given I have made progress in the game
    When I save my game with name "Test Save"
    Then a save file should be created
    And the save should contain my current game state
    When I load the saved game
    Then my character should be in the same position
    And my inventory should contain the same items
    And my game progress should be restored

  @auto-save @core
  Scenario: Automatic Save Functionality
    Given auto-save is enabled
    When I play for the configured auto-save interval
    Then the game should automatically save
    And I should see an auto-save notification
    When I pause the game
    Then an auto-save should be triggered
    And my progress should be preserved

  @performance @non-critical
  Scenario: Game Performance
    Given I am in a large map area
    When I move around extensively
    Then the game should maintain smooth performance
    And frame rate should remain stable
    When I perform multiple save operations
    Then each save should complete within 1 second
    And the game should remain responsive

  @error-handling @non-critical
  Scenario: Graceful Error Handling
    Given I attempt an invalid operation
    When I try to move to an invalid position
    Then the movement should be rejected
    And an appropriate error message should be shown
    When I try to load a corrupted save file
    Then the load should fail gracefully
    And I should be returned to the main game state

  @integration @core
  Scenario: System Integration
    Given all game systems are running
    When I perform a complete game action sequence
    Then the movement system should coordinate with animation
    And the inventory system should track collected items
    And the save/load system should preserve all state
    And all systems should work together seamlessly


