
#History

## v0.1
- Art and config for dirt, grass, stone, gold, knight, princess, etc
- First stable prototype
- World and Stage objects
- Isograph object
- Coord/Area objects
- Coordinate Translation and Isometric Rendering
- Build helper functions
- First "prairie" stage with some random materials

## v0.2 - Action time!
- Switch between 1x and 2x view
- World goes through steps
- Debug info panel showing passing time
- Show step number in debug
- Added slime actors with random movements

## v0.3 - Watch your step
- Rule to force actor to step of solid blocs
- Define solid/non-solid blocType attribute
- Non-solid bloc types: weeds, flowews
- Rule to prevent multiple "solid" blocks from taking space
- Smooth animation of blocs between stage steps
- Prevent mouse cursor from touching/selecting html elements of the scenegraph
- Actors dont all move at the same time

## v0.4 - Random, Canvas and Time management
- Control randomness with number generator and seed
- handle keystroke for "space" to Pause the game
- Added chicken actor and egg item
- Handle keystroke for "-/+" to accelerate or slow-down the game
- Render the isograph with canvas, usign raw canvas or easel.js http://easeljs.com/docs/

