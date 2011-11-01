# Gameplay layers

In order to simplify the gameplay and reduced the complexity of the game logic, the stage should follow a convention on how the landscape is composed.

## 3 Layers

## The ground layer (z=0)

The ground layer is the bottom most layer on which the characters walk. Since character cant walk onto emptyness, and that they cant climb on higher blocks, they are bound to walk on the ground layer.

The player is able to pickup blocks from this layer and drop them elsewhere, thus changing the shape of this ground layer.

## The character layer (z = 1 or 2)

The character layer lays on top of the ground layer and is two blocks high it is where the user can interact with the various game elements. A character can grab a block from the ground layer (z=0) and stack it up two blocks high in the character layer (z = 1 and 2).

When a character scans his surrounding, the scanning algorythms will only cosnider the character and ground layers.

If a character on "z=1" of the character layer grabs a blocks and carries it on it head, the carried block is still in the character layer.

A character are allowed to grab blocks that are in the ground and character layers, but not from the decorative layer.


## The decorative layer ( x =3 and up)

Anything higher than the character layer is consider to be the decorative layers. The blocks placed there by actors are visual cues for the player and should not be taken into acocunt in gameplay algorythms.

For example, a tree might grow from a seed block on the ground layer, and grow a trunk of two blocks in the character layer and continue growing its trunk and leaf blocks in the decorative layer. Apples may be shown in those blocks, but until they fall on the character layer the other actors should not be able to interact with them.

## Implied conventions
- Nothing under the ground layer
- Characters can only move on the XY plane, they cant climb onto blocks
- Characters are 1 square high when empty handed
- Characters are 2 square high when carrying an item on their hes
- The decorative layer should be cosmetic and can be made semitransparent to see characters better
