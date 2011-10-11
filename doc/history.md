
#Isomaton Version History

## v0.6 - Minidb Rules
- Minidb now has a publish/subscribe pattern and is publishing on add, remove and update.
- The old block registry has been replacd by a minidb
- The isograph now share the same block minidb as the stage and subscribe to its events
- Actors also have a minidb
- Renamed all "entity" vars to actor
- Movement rules specific to each entity (bird, fish, snake, person have each different rules?)
- Movement rules are reusable across actors. Ex.: cantWalkOnEmptyOrNonSolid, cantWalkIntoSolids
- FIXED: bug: rules not appling...

## v0.5 - Some basic expectations
- Fixed: Bug: Water and dirt blocks are generated one over the other and alternate during display
- Fixed: Bug: Grass has disapeared
- Added a Smaller "sidekick" entity
- Brought back animated and tweened movements of blocks between each steps
- Remove dependency on jQuery for the isograph
- Animated transitions using jstween instead of jquery: http://jstween.blogspot.com/
- Added helper for 4x4 sets of blocks
- Each block can now have its own extended spritesheet
- Blocks for material and actors have a directions. When actors move, they change their directions.

## v0.4 - Random, Canvas and Time management
- Control randomness with number generator and seed
- handle keystroke for "space" to Pause the game
- Added chicken actor and egg item
- Handle keystroke for "-/+" to accelerate or slow-down the game
- Render the isograph with canvas, usign raw canvas or easel.js http://easeljs.com/docs/

## v0.3 - Watch your step
- Rule to force actor to step of solid blocs
- Define solid/non-solid blocType attribute
- Non-solid bloc types: weeds, flowews
- Rule to prevent multiple "solid" blocks from taking space
- Smooth animation of blocs between stage steps
- Prevent mouse cursor from touching/selecting html elements of the scenegraph
- Actors dont all move at the same time

## v0.2 - Action time!
- Switch between 1x and 2x view
- World goes through steps
- Debug info panel showing passing time
- Show step number in debug
- Added slime actors with random movements

## v0.1
- Art and config for dirt, grass, stone, gold, knight, princess, etc
- First stable prototype
- World and Stage objects
- Isograph object
- Coord/Area objects
- Coordinate Translation and Isometric Rendering
- Build helper functions
- First "prairie" stage with some random materials


