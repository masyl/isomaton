# Roadmap for Isomaton

## In Progress Release

### v0.7 - Compulsory Mechanics
- DONE: Finish migration to the new Actor inheritance model
- DONE: Compulsion mechanics for Actors
- Make the knight follow a "hunt" compulsion when a slime within 10 blocks
- When the knight cant find the slime, it should fall back to his "explore" compulsion
- When a collision occur between two actors, emit a "collision" event
- bug: if the stage has 2 chickens, on chicken will be paralized by the others movements, because they have the same identity
- Simple calculation to move player "thoward" a target
- Functions to get "distance" between two blocks

### v0.8 - Get the Slime!
- Chicken and Sidekick should have exended spritesheets
- Implement A* pathfinding function for knight to hunt slime
	http://www.briangrinstead.com/files/astar/
	or http://www.matthewtrost.org/projects/astar/
- Action mechanics: hit, pull, push, touch, etc.
- When the knight is next to the slime he "hit" it
- When the slime is hit, it teleports elsewhere
- When an actor move farther than a single block, the transition is instant instead of animated


## Upcomming Releases

### v0.? - Menage-à-Trois
- Slime wandering: Picks a random destination and goes there.
- Slime fleeing: moves away slowly when the knight get within 10 blocks
- Slime attacking: attacks weak target when within 10 blocks (ex.: princess)
- Slime teleporting: Slime teleports elsewhere if it is hit
- Princess fleeing: moves away when a "monster" gets within 5 blocks
- Princess wandering: moves randomly if nothing else occurs
- Knight exploring: Picks a random destination and goes there.
- Knight attacking: Attacks when a "monster" gets within 10 blocks.

### v0.? - Trivial Compulsions
- Chicken fleas: moves away fast when someone else than another chicken comes near (2 blocks)
- Chicken flocking: moves back thoward other chickens if he gets too far (3 blocks)
- Chicken wandering: moves randomly if nothing else occurs
- Sidekick following: moves thoward knight, but never too near.
- Sidekick waiting: Stays put otherwise

### v0.? - iOS Compatible ?
- Disable animations and/or adapt fpd on ipad/iphone
- bug: Isograph doesnt always work on safari iOS... requires reload
- Support a touch-compatible ui of slowmo/fastforward, play, pause, etc.
- Adapt the size of the viewport to match either fullscreen or 1:1


### v0.? - Save, Quit and Resume
- Ability to serialize and deserialize a complete world/stage state
- Save a serialized checkpoint and resume from this checkpoint
- Ability to quit and resume a game where it was left
- handle keystroke for "S" to Save Checkpoint
- handle keystroke for "Q" to Quit and Save
- handle keystroke for "R" to Resume from checkpoint
- Make a predictable "save checkpoint" and "restart from checkpoint" to test world determinism
- Remember the playState and speed when resuming a saved game

### v0.? - Smooth moves
- Isograph can be modified with difgram or changelog
- Actors should not try to move on a non-moving block, they should detect their move is no possible

### v0.? - Story log
- Actors say/think stuff in a speech bubble
- A story log stores all the significant game actions and actor exclamations
- Achievements and Inventory changes are logged to the story log

### Chicken & Egg
- Chicken actor which lays eggs
- Chicken Compulsion: If chicken doesnt see other chicken or egg for too long he lays an egg, if egg isnt picked up in X steps, it spawns another chicken.
- Slime compulsion: Attack chicken (along with princess)
- Chicken dies/disapear if hit byt slime
- Knight Compulsion: pick up eggs (or any item) and put in inventory

### v0.? - Health
- Health meter for actors
- knight looses healt when colliding with slime
- Actor dies when he looses all his health
- Knight eats egg from inventory to gain back health

### v0.? - Success or failure
- "Knight kills slime" objective
- "Knight finds gold" objective
- Show level objectives and report achievement in story log
- Win and start new level swhen knight objectives are met
- Loose and restart stage when knight dies


## Unplanned releases

### Inventory
- "item" bloc types... pickable whe stepping on or next to them, floating a little
- Actor grabs gold and puts in his inventory
- Actor grabs sword and puts in his inventory

### Let's fight
- Knight attacks slime with bare hands
- Knight finds sword
- Knight attacks slime with found sword


### Times Arrow
- HTML5 persistance to stop/resume (persist blocks, entity state (position, inventory, health)
- Day and night settings/cycles with ambiant decor (day, night, sun, moon, stars, clouds, etc)
- API for other time-based property changes (biorythm, seasons, weather);

### Storytelling
- Show relevant actors in the UI with label
- Zoom scenegraph to show only a portion of the screen in more details/drama
- During "setups", some blocs are added by falling from the sky
- Each levels/acts separated by black screen with title

### Optimization
- Cache Isoggraph Bitmap output by layers and chunks and update/redraw only when content has changes
	Each layer is composed of slices of blocks ith depth-index between X and Y, And each layer is composed of rows of blocks of from the same z axe. So instead of multiple ticks of 1200 draws (20x20x3) you get a first pass of 1200 draws which is cached in (20x3) 60 rows grouped in 20 layers. Each subsequent unmodified tick only has between 20 draw, and up for re-caching. When coords are changed for a block, this invalidates the cached bitmap sets it is part of
- Rethink how the depth-sorting is done, so that only the changed bitmaps need to be re-ordered

# Unplanned Backlog

## Bugs and Debts

- Bug: Flowers, weeds and other blocks appear over water
- Bug: Actors can spawn over solid blocks
- Bug: z-index calculation and ordering doesnt account for some cases during animation
- Debt: block type should have their own class for their properties, not be read from property file
- Debt: use constants for playStates (rename to playbackMode ?  rewind, play, pause, or just an integer ?
- Debt: ability to instantiate an actor without a coordinate

## Housekeeping and Architecture
- Bring back source PSD of common world into the project
- Create a build script
- Test long term playback: number limits, memory leaks

## Features
- Ambiant Soundtrack
- Rename world for theater ?
- Spritesheets and lighting adaptation to day/night cycle
- Add knight actor which looks for gold on its own
- When the slime teleports, it goes in a puff of smoke.
- Chicken actor emits chicken sounds
- Give actors the ability to move up and down one block denivelation
- Placing blocs by layering them (falling from the sky until they touch ground
- Enforcing limits on the maximum width/height/tallness of the world
- The terrain and its elements should be an actor
- Actors represented by more than one block: princess with a tall crown, cow, girraf, elephant.
- Have a global seed to change whole world
- Have a stage seed to be changed as part of the gameplay.
- Actors (ex: chickens) of same types must have unique ids to prevent them to move in synch with same procedural randomness
- Non solid block type should have a z priority, so that smoke appears over an egg, and the egg over the grass
- Better choice of easing for actor animation... could even "hop" on the next coordinate
- Water has two bloc states... water on top and water under another bloc (same situation elsewhere?)
- Figure out how item crafting/alchemy plays into the story and how it is done
- Rotate the stage n, e, s, w. and show a compass rose or arrows for cardinal directions
- Render block shadows and add property to "hasShadow" to blocks


## Far Future Backlog

- Multiplayer Server/Gameplay
- Rewind a game to any given point


## Abandonned ideas

- Show a top-view map. The new concept doesnt require scrolling across a larger than viewport world.
- Coord movements in 26 directions instead of 6 directions ? No. This would complexify any "push/pull" logic too much


## Ideas for Bloc Types and Items

- Naturals
	- Long grass
	- Mushrooms
	- Flowers
	- skelletons, fossils
	- Small rocks, Big rock, pebbles
	- Puddle
- Material
	- Ores: iron, coal, gold, diamond
	- Marbles
	- Cobblestone, gravel
	- Brick
	- Marsh
- Liquids
	- Tar
	- Lava
	- Blood
- Tools:
  - Sword
  - Knife
  - Bow
  - Shield
  - Whip
  - Armor: helmet, boots, etc
- Items:
  - Scrolls
  -
  -
  -
- Creatures
	- Ghosts
	- Spiders
	- Wasp
	- Skeletons
	- Zombies / Undead
	- Blobs
	- 

- Animals
	- Pig
	- Cow
	- Chicken
	- Duck
	- Cat
	- Dog
	- Wolf
	- Rat / Mouse
	- Frog
	- Turtle
	- Bird
	- Snake
	- Bees

- Other
	- Meat
	- 