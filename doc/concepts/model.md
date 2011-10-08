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

