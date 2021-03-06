#Isomaton Version History

### v0.11 Get Down With BOB (Big Object Bag)
- Fork MiniDB into BOB
- Set method
- Bobify the Block class
- Apply the Bobs' set method on all Block usage
- Bobify the Actor class
- Apply the Bobs' set method on all Actor usage
- Merge the actors and blocks MiniDB to a single Bob store
- Publish a "change" event of set actions to prevent the need to trigger updates manually
- Make Bob selections work like jQuery contexts

### v0.10 Select and Edit Tools Incomplete

- The user can select a coordinate by clicking on a decor block
- A 5 blocks high column of cursor blocks appears at the selected coordinate
- Keyboard arrows move the cursor column
- The "pause" action is remapped to the ESC key
- Only blocks without actors can be moved in edit mode.


### v0.9 - Life & Status

- Music stops on pause
- FIXED: bug: pausing the game doesnt pause the rendering... still using cpu at max
- Canvas is now 16x9 and resizes to page width
- REMOVE: Chickens sound for now
- Slime has 3 health points
- Slime loses 1 health point when hit
- hitProtection scheme to prevent multiple close hits
- Slime dies and disapear in a puff when health goes down to 0
- Added mouse events for mouseover, mouseout, mousedown, mouseup, mousemove.
- Added focus and blur events on blocks and actors
- "Hit" sound when a actor is hit
- Display character status in the isograph
- Health meter in the character status
- Chicken have 2 health points
- FIXED: bug: invalid moves are animated before they get invalidated or rolled back!!! make weird results
- FIXED: bug: on first draw, the depth ordering is wrong

### v0.8 - Get the Slime!

- Bigger sprites for blocks
- Sidekick has etended styleheet
- Act/React mechanics and hit action.
- When the knight is next to the slime he "hit" it
- When the slime is hit, it teleports elsewhere
- When an actor move farther than a single block, the transition is instant instead of animated
- Mechanics for spawn points where actors can respawn from
- Soundtrack
- Sound effects
- Animated Puff effect when character re-spawn
- FIXED: bug: actor moves one last step after being told to teleport
- Chicken sounds
- Block animations can be dynamic
- Chicken should be redrawn as a block and have exended spritesheets
- Princess has a been redrawn and has a crown
- FIXED: bug: actors can move two on the same spot in some cases!

### v0.7 - Compulsory Mechanics

- Finish migration to the new Actor inheritance model
- Compulsion mechanics for Actors
- bug: if the stage has 2 chickens, on chicken will be paralized by the others movements, because they have the same identity
- Actors now have a type property and their IDs are unique within a stage
- Added more chickens
- Compulsion for chickens to flock together and flea non-chickens
- Compulsion for princess to espace the slime and watch the chickens
- Compulsion for the knight to hunt the slime
- Compulsion for the sidekick to follow the knight at a respectable distance
- Compulsion for the slime to hunt the princess and escape the knight
- Compulsion behaviors are weighted according to each actors settings
- Helper function to get the possible directions "thoward" a coord from another coord
- Helper function to get "stepDistance" between two coord


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


