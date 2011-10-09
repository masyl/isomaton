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

## Act

An act, similar to a level or an episode, start at one point and sets objectives and goals to be acted out on the stage.

Similar to entities, an act can interact with the stage at each steps. Being the main "controller" entity, the act has priority on other entities.

The world contains multiple predefined acts and there is no specific order in which they are played out. Their order is defined by procedural generation. When selecting an act, the world will ask each available act if the current stage is appropriate for them to start. Each act can look at the stage state and decide if the required elements are present. From all that can occur on the stage, the game will select one that hasnt occured yet, or one that has occured less often.

Once an act starts, a interstitial screen might appear and the UI will reflect this change. At any point forward, the act will decide when it is over and pass on the control over to the next act.

An act also contains the necessary title, descriptions, achievements, role definitions so that a user knows how he can help to move things along and get the hero to achieve his goals.

Acts must be available in enough number and variety that the game can move on from one to the other ideally without creating dead ends, stalemates or endless loops.

Acts could also be polymorphic, adapting or changing their nature according to the conditions and the state of the stage or its actors. For example, a "kill the dragon" act could spawn a different dragon depending on the weather or the other actors on stage. If a princess is present it could be a dragon that kidnaps the princess, otherwise a dragon that steals a treasure.


## Actor Role

During an Act, some actors might play a leading roles, which will make them higlighted in the ui and easally accessible for interaction with the user.

## Actor Mode

As time goes by, an Actor will need to change its behavior according to the situation he is in. On basic way the actors do this is by going in and out of "modes". A knight in "explore" mode might not have any specific target and just wander from one spot of the stage to another in search of something interesting.

Upon a specific stimulus, an actor will change from on mode to the other. For example, if a knight encounter an egg in "explore" mode, he might suddenly fall in "gathering" mode and start to pickup surrounding items until there is none left in sight. Another basic scenario is to have the knight enter in "battle" mode when encountering a Slime and start to attack any surrounding enemy.

Obviously, some modes will have priority, such as not having the knight fall into "gathering" mode to pickup eggs when in the middle of an epic battle.


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