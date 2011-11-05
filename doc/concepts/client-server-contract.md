
# Messages between server and clients:

## Broadcasts from server

- emit: step
	rev=
	changelist=
		change: add|remove|edit
		block:
			id=
			x=
			y=
			z=
			dir=

- emit: pause


## Message from client

- emit: spawnPlayer
	nickname=
	skin=

- emit: getStage (receive the complete layout of the stage)
	rev=
	changelist=

- emit: moveCursor
	x=
	y=

- emit: activateCursor
	x=
	y=

-
