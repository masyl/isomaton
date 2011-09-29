
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
- Add edslime actors with random movements


#In Progress Release

## v0.3 - Watch your step
- done: Rule to force actor to step of solid blocs
- done: Define solid/non-solid blocType attribute
- done: Non-solid bloc types: weeds, flowews
- done: Rule to prevent multiple "solid" blocks from taking space
- done: Smooth animation of blocs between stage steps
- done: Prevent mouse cursor from touching/selecting html elements of the scenegraph
- Rule to allow actor to occupy same space as a non-solid block, with the proper overriding z-index
- Detect/Control collisions between actors and blocks
- When placing blocs, enforce cohesion rules (no two blocs, occupying)
- Placing blocs in "replace", "dont-replace" mode
- Placing blocs by layering them (falling from the sky until they touch ground
- Enforcing limits on the maximum width/height/tallness of the world

#Upcomming Releases

## v0.? - Smooth moves
- Isograph can be modified with difgram or changelog
- Add orientation to actors, blocs (n, e, w, s)
- Add knight actor which looks for gold on its own
- Actors should no try to move on a non-moving block, they should detect their move is no possible

## v0.? - Control
- Player commands knight with keyboard/mouse (attach, retreat, follow);

## v0.? - Story log
- A story log stores all the significant game actions
- Inventory changes are logged to the story log


## v0.? - Health
- Health meter for actors
- knight looses healt when colliding with slime
- Actor dies when he looses all his health

## v0.? - Success or failure
- "Knight kills slime" objective
- "Knight finds gold" objective
- Show level objectives and report achievement in story log
- Win and start new level swhen knight objectives are met
- Loose and restart stage when knight dies


# Unplanned releases

## Chicken & Egg Release
- Chicken actor which lays eggs
- Knight can pick up eggs and put in inventory
- Knight eats egg from inventory to gain back health

## Inventory Release
- Actor grabs gold and puts in his inventory
- Actor grabs sword and puts in his inventory

## Let's fight
- Knight attacks slime with bare hands
- Knight finds sword
- Knight attacks slime with found sword


# Unplanned Backlog

- Better choice of easing for actor animation... could ever "hop" on the next coordinate
- Water has two bloc states... water on top and water under another bloc (same situation elsewhere?)
- Figure out how item crafting play into the story and how it is done
- "item" bloc types... pickable whe stepping on them, floating a little
- Show relevant actors/entities in the UI with label
- HTML5 persistance to stop/resume (persist blocks, entity state (position, inventory, health)
- Day and night settings with ambiant decor (day, night, sun, moon, stars, clouds, etc)
- Each levels separated by black screen with title
- Actors say/think stuff in a speech bubble
- Rotate the stage n, e, s, w. and show a compass rose or arrows for cardinal directions
- Show bloc cursor by translating mouse cursor position back to isometric coordinates
- Scroll scenegraph to show only portion of a larger stage
- Render block shadows and add property to "hasShadow"
- Control randomness with number generator and seed
- During "setups", some blocs are added by falling from the sky
- Control game speed: Slowdown, Fastforward
- Ability to pause the game


# Far Future Backlog
- Multiplayer Server/Gameplay
- Rewind a game to any given point

# Abandonned ideas
- Show a top-view map. The new concept doesnt require scrolling across a larger than viewport world.
- Coord movements in 26 directions instead of 6 directions ? No. This would complexify any "push/pull" logic too much

# Ideas for Bloc Types and Items
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