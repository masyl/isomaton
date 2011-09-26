
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


#In Progress Release

## v0.2 - Action time!
- done: Switch between 1x and 2x view
- done: World goes through steps
- done: Debug info panel showing passing time
- done: Show step number in debug
- done: Add slime actors with random movements
- Isograph can be modified with difgram or changelog

#Upcomming Releases

## v0.3 - Solid rules
- Define solid/non-solid blocType attribute
- Non-solid bloc types: longgrass, pebbels, flowews, mushrooms
- Rule to force actor to step of solid blocs
- Rule to prevent multiple "solid" blocks from taking space
- Rule to allow actor to occupy same space as a non-solid block

## v0.2 - Action time!

## v0.4 - Moving around
- Add knight actor which looks for gold on its own
- Detect/Control collisions between actors and blocks
- Add orientation to actors, blocs (n, e, w, s)

## v0.5 - Control
- Player commands knight with keyboard/mouse (attach, retreat, follow);

## v0.6 - Story log
- A story log stores all the significant game actions
- Inventory changes are logged to the story log


## v0.7 - Health
- Health meter for actors
- knight looses healt when colliding with slime
- Actor dies when he looses all his health

## v0.8 - Success or failure
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
- Show relevant actors/entities in the UI with label
- HTML5 persistance to stop/resume (persist blocks, entity state (position, inventory, health)
- Day and night settings with ambiant decor (day, night, sun, moon, stars, clouds, etc)
- Each levels separated by black screen with title
- Actors say/think stuff in a speech bubble
- Rotate view n, e, s, w. and show a compass rose or arrows for cardinal directions
- Show bloc cursor by translating mouse cursor position back to isometric coordinates
- Scroll scenegraph to show only portion of a larger stage
- Render block shadows and add property to "hasShadow"
- Prevent mouse cursor from touching/selecting html elements of the scenegraph
- Control randomness with number generator and seed
- During "setups", some blocs are added by falling from the sky
- Control game speed: Slowdown, Fastforward
- Ability to pause the game

# Far Future Backlog
- Multiplayer Server/Gameplay
- Rewind a game to any given point

# Abandonned ideas
- Show a top-view map. The new concept doesnt require scrolling across a larger than viewport world.

