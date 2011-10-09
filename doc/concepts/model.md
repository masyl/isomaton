# The Tinycraft Object Model

## World

## Stage

## Step

## Time

## Entity

An entity is a base conceptual element which can act on each world step. Many other elements derive from this class. They are abstract, but can manifest themselves on stage by placing/moving blocks. A single entity might be composed of a single block are hundreds. A knight or slime are actor entities, but the decor is also an entity. Some entities could even be invisible to the user and exist only to make things happen in the game. Ex.: A "thunder god" entity could be active, invisible, but from time to time struck lightning by placing lighting blocks on stage.

## Block

Blocks are the material representation of entities. An entity can create and manipulate many blocks on stage. Block are rendered by the isograph.

## Isograph

The isograph is the api used to render the isometric interface of a stage and its content. Non-isometric ui which doesnt need to match precise coordinate will typically no be handled by the isograph.


# FUTURE DEVELOPMENT

## Actors

Actors are a type of entities which are presented to the user as bein part of the story. The material scene, props, items or other interactive elements such as water, levers and etc. are not actors. But animals, heroes, bad guys are. Actors might need to be interacted with and presented differently

## Block Properties
- entity :

## Block Material Properties

- matterState : solid, liquid, gas (solid)
- nature : animal, vegetal, elemental (elemental)
- isAlive: true/false (false)
- opacity: If you can see through this block (1)
- weight : (1)
- height : relative height of items (1)
- resistance/strength : stone is resistant, whool not (1)
- depthIndex : (for z ordering); (1)
- lightLevel : How much light does it emit (0)
- temperature : cold, room temp, hot, burning (0)
- isFire : can trigger fire (false)
- isFlamable : can burn (false)
- isPickable : Can be grabbed by the user an placed in inventory (false)
- isBreakable : Can be broken down by hitting it. (false)
- isPushable : Can be pushed (false)
- isPullable : Can be pulled (false)
- isUsable : Can be used by an entity (false)
- chemistry: Chemical composition (false)
- isStep : Can be walked on to go up or done (false)

## Inventory Items Properies
- isEdible :
- nutritiveValue : 
- isUsable :
- isStackable :


## Block Events
- place : An block has just been placed on the stage
- removed : A block is removed from the stage
- pick : An entity has picked up this item
- hit : A block is hit by an entity with something
- break : A block is broken after being hit hard enough and long enough
- moved : An entity has pushed or pulled the block
- step : An entity has stepped on a block
- topped : Another block has been placed on it
- collide : A collision occured between this block and another block or entity
- share : This block is sharing space with another block
- use : An entity is "using" this block




To sort out....

Actors derived from entities ?

Or just actors with roles ? (with actors and entities being the same) ?

NO NO NO... The notion of "actor" is only relevant when a script is in effect... in one script a skelleton might play an actors role, but in another he might be some anonymous prop.