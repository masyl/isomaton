
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
- World goes through steps
- Add slime actor with random movements
- Isograph can be modified with difgram or changelog
- Debug info panel
- Show step number in debug

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
- Actors say/think stuff in a speech bubble
- Switch between 1x and 2x view
- Rotate view n, e, s, w.

