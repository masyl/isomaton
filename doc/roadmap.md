# Roadmap for Tinycraft

## Bugs and Debts


## In Progress Release

### v0.5 - Some basic expectations

- DONE: Bug: Water and dirt blocks are generated one over the other and alternate during display
- FIXED: Bug: Grass has disapeared
- DONE: Added a Smaller "sidekick" entity
- DONE: Brought back animated and tweened movements of blocks between each steps
- DONE: Remove dependency on jQuery for the isograph
- DONE: Animated transitions using jstween instead of jquery: http://jstween.blogspot.com/

- Bug: Actors can walk into each-others
- Actors dont walk on water
- Blocks for material and entities have a directions. When actors move, they change their directions.


## Upcomming Releases

### v0.? - Rules, rules, rules
- Make the knight hunt the slime, and the slime teleport when its touched
- Implement A* pathfinding function with
	http://www.briangrinstead.com/files/astar/
	or http://www.matthewtrost.org/projects/astar/
- Rule to allow actor to occupy same space as a non-solid block, with the proper overriding z-index
- Detect/Control collisions between actors and blocks
- When placing blocs, enforce cohesion rules (no two blocs, occupying)
- Placing blocs in "replace", "dont-replace" mode
- Placing blocs by layering them (falling from the sky until they touch ground
- Enforcing limits on the maximum width/height/tallness of the world


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
- Add direction/orientation to actors, blocs (n, e, w, s)
- Add knight actor which looks for gold on its own
- Actors should not try to move on a non-moving block, they should detect their move is no possible

### v0.? - Story log
- Actors say/think stuff in a speech bubble
- A story log stores all the significant game actions and actor exclamations
- Achievements and Inventory changes are logged to the story log


### v0.? - Health
- Health meter for actors
- knight looses healt when colliding with slime
- Actor dies when he looses all his health

### v0.? - Success or failure
- "Knight kills slime" objective
- "Knight finds gold" objective
- Show level objectives and report achievement in story log
- Win and start new level swhen knight objectives are met
- Loose and restart stage when knight dies


## Unplanned releases

### Inventory Release
- "item" bloc types... pickable whe stepping on or next to them, floating a little
- Actor grabs gold and puts in his inventory
- Actor grabs sword and puts in his inventory

### Chicken & Egg Release
- Chicken actor which lays eggs
- Knight can pick up eggs and put in inventory
- Knight eats egg from inventory to gain back health

### Let's fight
- Knight attacks slime with bare hands
- Knight finds sword
- Knight attacks slime with found sword


### Times Arrow
- HTML5 persistance to stop/resume (persist blocks, entity state (position, inventory, health)
- Day and night settings with ambiant decor (day, night, sun, moon, stars, clouds, etc)
- API for other time-based property changes (biorythm, seasons, weather);

### Storytelling
- Show relevant actors/entities in the UI with label
- Zoom scenegraph to show only a portion of the screen in more details/drama
- During "setups", some blocs are added by falling from the sky
- Each levels/acts separated by black screen with title


## Unplanned Backlog

### Housekeeping and Architecture
- Rename to minicraft
- Bring back source PSD of common world into the project
- Create a build script
- Test long term playback: number limits, memory leaks

### Features
- Actors (ex: chickens) of same types must have unique ids to prevent them to move in synch with same procedural randomness
- Non solid block type should have a z priority, so that smoke appears over an egg, and the egg over the grass
- Better choice of easing for actor animation... could even "hop" on the next coordinate
- Water has two bloc states... water on top and water under another bloc (same situation elsewhere?)
- Figure out how item crafting play into the story and how it is done
- Rotate the stage n, e, s, w. and show a compass rose or arrows for cardinal directions
- Render block shadows and add property to "hasShadow"


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