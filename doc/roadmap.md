# Roadmap for Isomaton

## In Progress Release

### v0.12 BOB reversed is BOB
- Automatic Revision Log
- Commit()
- Rollback([revision|tag])
- Tag(id)
- Branch/Fork(id)

### v0.? Select and Edit Tools Complete

- helper method to get the top-most block at a coodinate
- In "edit" mode the space bar will remove and place back any block. The blocks are stored in the players inventory in the bottom right quadrant.

## Upcomming Releases


### v0.? - Inventory
- "item" bloc types... pickable whe stepping on or next to them, floating a little
- When selecting an item, the item gets picken up by the first actor with inventory capacity
- Compulsion for Knight to eat eggs from inventory to gain back health
- Compulsion to pick up items that match their interests/tastes
- Slime grabs egg and puts in his inventory
- Each character has a specific inventory limit
- Show inventory in character Status
- In "game" mode the hitting space bar when a character is under the cursor will select this actor and hypnotise it. From there, the character will try to follow the cursor. When a character is following the cursor, space will ask the player to pickup the top-most block in front of him, and pressing enter will place one of his block.


### v0.? Spawner & True Death
- The slime dies when it runs out of life
- New slime respawns after 10 steps
- Spawner actor responsible for spawning actors after X steps when none exists. The spawner will choose a random spawn point.
- The stage adds a spawner instead of the slime itself.
- Spawner for chickens
- Spawner for slime



### v0.? - Chicken & Egg
- Slime attacks chickens instead of hunting the princess when they are near enough
- Chicken actor which lays eggs
- Chicken Compulsion: If chicken doesnt see other chicken or egg for too long he lays an egg, if egg isnt picked up in X steps, it spawns another chicken.
- Slime compulsion: Attack chicken (along with princess)
- Chicken dies/disapear if hit byt slime
- Knight Compulsion: pick up eggs (or any item) and put in inventory


### v0.? - HTML5 at all cost

- DONE: Use HTML5 Sound API
- Persistance of current game
- Button to restart
- Complete deployment to the Chrome Store
- "Whats new" inside the app
- Offlining ?
- In app purchase ?

### v0.? - Story Time - Sheep and wolfs

- Possibility to abandon an act ?
- Wolf actor
- Sheep actor based on chicken
- Keep the sheeps act
- Action to break mature sheep in 3 smaller sheep
- Compulsion for sheep to turn into evil sheep when too much sheeps
- Young sheeps grown into adult sheeps
-

### v0.? - Menage-à-Trois

- Slime wandering: Picks a random destination and goes there.
- Slime fleeing: moves away slowly when the knight get within 10 blocks
- Slime attacking: attacks weak target when within 10 blocks (ex.: princess)
- Slime teleporting: Slime teleports elsewhere if it is hit
- Princess fleeing: moves away when a "monster" gets within 5 blocks
- Princess wandering: moves randomly if nothing else occurs
- Knight exploring: Picks a random destination and goes there.
- Knight attacking: Attacks when a "monster" gets within 10 blocks.

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

### v0.? - Success or failure
- "Knight kills slime" objective
- "Knight finds gold" objective
- Show level objectives and report achievement in story log
- Win and start new level swhen knight objectives are met
- Loose and restart stage when knight dies


## Unplanned releases

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

- bug: the soundtrack doesn loop properly
- Bug: Flowers, weeds and other blocks appear over water
- Bug: Actors can spawn over solid blocks
- Bug: z-index calculation and ordering doesnt account for some cases during animation
- bug: Sometimes, the pop sound doesnt playback correctly
- bug: must remove "puff" block effect when its finished ... after x steps
- bug: respawning can create multiple puff blocks one over the other
- bug: The depth ordering isnt always correct during animations
- Debt: block type should have their own class for their properties, not be read from property file
- Debt: use constants for playStates (rename to playbackMode ?  rewind, play, pause, or just an integer ?

## Housekeeping and Architecture
- IMPORTANT: The main object properties should be handled by a uniform property by handler with get/set methods, to make serialization and transactionnal logs more automatic
- Should there really be coord props on entities? Or should it be handled byt their blocks ? Its redundant.
- Add a combined xyz key in the Blocks and actors toIndex method
- Sound effects should be configurable just like sprites with a declarative model
- Give names to all anonymous functions for better profiling
- Resegment big packages into smaller packages
- Use declarative FrameData so that spritesheets are decoupled from code
- Use mixxins in addition to inheritance to compound actor properties and behaviors (prevent multiple inheritance)
- Bring back source PSD of common world into the project
- Create a build script
- Test long term playback: number limits, memory leaks
- Clean todos in code

## Features
- See how this new tweening lib compares https://github.com/sole/tween.js
- Disable/Enable sound with offstage block
- Totems Gameplay Concept: Affect the gameplay by errecting totems of blocks. When the correct combination is place together the totem actor can repel, attract, spaw, kill other elements on stage.
	+ 3 Gold blocks totam could hypnotize and paralyze all slime and prevent the spawning of slimes.
	+ 2 Wood blocks with an egg on top could raise the maximum of chickent to twice its current values!
	+ 2 ice blocks with 1 torch could create a water source around the totem
	+ 2 black rocks + 1 dead chicken could transform all chickens into zombie chickens
	+ 2 wood block + 1 leaf could spawn a tree
- Totem mechanics: Player casts a divine light on a x/y coordinate, selects the actors he can influence to go near the light to build the totem, then force the various actors to place blocs from their inventory to form the totem. When the right recipee is obtained it is automatically trigerred and the totem is sealed.
- User interaction constraint: User doesnt place items directly on stage himself. Instead he motivates an actor to place the item at a speciific spot.
- Put an actor in a trans to motivate an actor to continue a task he is doing no matter what.
- Place a totem of object of veneration to force an actor to stay winthin a certain range.
- Actor motivates an actor to pickup something
- Actors that can be motivated to do some things. Knight is motivated to attact an enemy or pick up, place or use a specific item. Monster is motivated to eat one prey over another.
- Dying actor crumbles to a pile of bone and awaits resurection. can be picked up for lter use or is swept away by passing time.
- Resurection spell that can be triggered at a distance.
- Actors with less generic names and titles:
	Bob the Funky Chicken vs. Chicken
	Peter the valiant knight vs Knight
- Variation on compulsion for events that dont need to compete for exclusivity (sounds, exclamations)
- On click, show the actor or block stats
- Implement A* pathfinding function for knight to hunt slime
	http://www.briangrinstead.com/files/astar/
	or http://www.matthewtrost.org/projects/astar/
- The hero can transform into another type of entity. By eating something, carying an item, casting a magic spell, drinking a potion, etc.
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
- Tree entity that grows and drop apples blocks or other fruits. Starts with a sappling, and grows to a 5 blocks high tree. All vegetable eaters should have the impulse to pick the fruits.

## Far Future Backlog

- Multiplayer Server/Gameplay
- Rewind a game to any given point


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