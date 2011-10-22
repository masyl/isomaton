/*
Optimization:
BASE
	5 Actors
	40 fps animé
	80 fps sans anim
	145 fps sans render
	600 fps - no render, batched steps

NEW
	5 Actors
	? fps animé
	124 fps sans anim
	? 145 fps sans render
	? 600 fps - no render, batched steps

Optimizations:
	- test run without delay... or raw setTimeout
	- Usage de minidb au lieu du custom registry
	- Generation de faux random avec banque de chiffres pré-calculés
	- Better handling of state changes between steps (not having to cycle through each blocks)
	- Faster debug (html write, access by id, keep ref to element)
	- Debug to show only fps
	- Keystroke to activate/dactivate show/hide fps
	- Keystroke to show/hide debug
	- Option to render the isograph with canvas

 */
(function IsomatonStagePackage(Isomaton, $, _, undefined) {

	// Constants for editModes
	var editModes = Isomaton.editModes = {
		normal: "normal",
		emptyFirst: "emptyFirst"
	};

	Isomaton.Stage = function Stage(id, stageOptions) {
		mixinPubSub(this);

		var stage = this; // Self reference used inside deeper closures

		// todo: use a factory to create such functionnal getter/setters
		this.editMode = function() {
			var _editMode;
			return function (editMode) {
				if (editMode !== void 0) {
					_editMode = editMode;
				}
				return _editMode;
			};
		}();

		this.state = new Bob(); // Object bag for blocks and actors
		this.world = null;
		this.isograph = null;
		this.time = 0; //todo: eventually match this to the stateMacine revision number
		this.speed = 200;
		this.speedMultiplier = 1;
		this._options = {};
		this.playState = "play";

        /**
         *
         * @param {String} [prefix]
         */
		this.uid = function(prefix) {
			return _.uniqueId(prefix);
		};

		this.sps = {
			previous: 0,
			current: 0,
			currentSecond: new Date().getSeconds(),
			update: function update() {
				//calculate the FPS
				var second = new Date().getSeconds();
				if (second !== this.currentSecond) {
					this.previous = this.current;
					this.current = 0;
					this.currentSecond = second;
				}
				this.current = this.current + 1;
			}
		};


		this.init = function init() {
			this.editMode(editModes.emptyFirst);
			this.options(stageOptions);
		};

		this.options = function options(_options) {
			_(this._options).extend(_options);
			return this._options;
		};

		this.random = function random(key) {
			return this.world.random(this.time, key);
		};

		this.randomItem = function randomItem(key, items) {
			var i;
			i = parseInt((this.random(key)) * (items.length));
			return items[i];
		};

		this.serializer = function serializer(json) {
			var obj = json || {};
			if (json) {
				// todo: deserialization
			} else {
				obj.speedMultiplier = this.speedMultiplier;
				obj.time = this.time;
				obj.playState = this.playState;
				obj.actors = {};
				obj.blocks = {};
			}
			return obj;
		};

		this.start = function start(world, options) {

			// Setup sound

			var sounds = stage.sounds = {
				play: function play(soundId) {
					var sound = this[soundId];
					if (sound) {
						sound.play();
					} else {
						console.error("Missing sound: ", soundId);
					}
				}
			};
			soundManager.url = '../src/libs/soundmanager-297a/swf/';
			soundManager.debugMode = false;
			soundManager.flashVersion = 9; // optional: shiny features (default = 8)
			soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
			soundManager.useHTML5Audio = true;
			console.info("starting sound manager");
			soundManager.onready(function() {
				console.info("sound manager is ready!");
				soundManager.preferFlash = false;
				sounds.soundTrack = soundManager.createSound({
					autoLoad: true,
					id:'soundtrack',
					url: "../../sounds/Nurykabe-Arrivee-distante.ogg",
					volume: 0
				});
				sounds.soundTrack.play({
					loops: 3
				});
				sounds.pop = soundManager.createSound({
					autoLoad: true,
					id:'pop',
					url: "../../sounds/pop.ogg",
					multiShot: true
				});
				sounds.chicken = soundManager.createSound({
					autoLoad: true,
					id:'chicken',
					url: "../../sounds/chicken.ogg",
					multiShot: true
				});
				sounds.hit = soundManager.createSound({
					autoLoad: true,
					id:'hit',
					url: "../../sounds/hit.ogg",
					multiShot: true,
					volume: 0
				});

			});

			this.world = world;
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
			this.isograph.setup(onSetup);
			this.isograph.bind(this.state);
			this.isograph.subscribe("blockSelect", function(block) {
				stage.onBlockSelected(block);
			});

			function onSetup() {
				// todo: find a better way than calling from options
				stageOptions.start.call(stage);
				stage.step(1);
			}
		};

		this.placeBlocks = function placeBlocks(blocks) {
			var i, newBlock, coord, existingBlocks, mode, key, removed;
			mode = this.editMode();
			for (i in blocks) {
				newBlock = blocks[i];
				coord = newBlock.coord;
				if (mode === editModes.emptyFirst) {
					removed = this.state
						.find({
							"class": "Block",
							"coord.x": coord.x,
							"coord.y": coord.y,
							"coord.z": coord.z
						})
						.remove();
				}
				this.state.add(newBlock);
			}
		};

		this.faster = function faster() {
			if (this.speedMultiplier > 16) {
				jQuery.fx.off = true;
			}
			this.speedMultiplier = this.speedMultiplier * 2;
			if (this.speedMultiplier > 1024) {
				this.speedMultiplier = 1024;
			}
			// update the speed of the isograph
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
		};


		this.pickedUpBlock = null;
		/**
		 * Pick up the top-most block currently under the cursor and keep it up along with the cursor
		 * until it is put down again
		 */
		this.pickUpBlock = function pickUpBlock() {
			var block, blocks, coord;
			if (this.selectedCoord) {
				coord = this.selectedCoord;
				blocks = this.state.find({
					"class": "Block",
					"coord.x": coord.x,
					"coord.y": coord.y
				});

				//todo: fix error: Remove cursor blocks from selection
				// use a .filter({group:""}) method on the miniDB

				// todo: add a "sort" method to minidb to get the top most block
				if (blocks.length > 0) {
					block = blocks[0];
					this.pickedUpBlock = block;
					block.coord.z = 10;
//					this.state.update(block);
				}
			}
		};

		/**
		 * Put down the block that the cursor is currently carrying
		 */
		this.putDownBlock = function putDownBlock() {

		};

		this.selectedCoord = null;
		this.updateCursor = function updateCursor() {
			var i, block, coord, cursorBlock, cursorBlockType;
			coord = this.selectedCoord;
			if (coord) {
				coord.z = 0;
				// find and delete all block for the actorStatus group
				this.state.find({
					"class": "Block",
					group: "cursor"
				}).remove();

				// place a series of cursor blocks
				this.editMode(Isomaton.editModes.normal);
				for (i = 0; i < 11; i = i + 1) {
					cursorBlockType = this.world.blockTypes["cursors.whiteframe"];
					block = new Isomaton.Block(cursorBlockType, coord, true, "cursor");
					this.placeBlocks([block]);
					coord.up();
				}
			}
		};

		this.onBlockSelected = function onBlockSelected(block) {
			if (!block.actor) {
				this.selectedCoord = block.coord.copy();
				this.updateCursor();
			}
		};

		this.actorSelect = function actorSelect(actor) {
			this.setActorStatus(actor);
		};

		this.up = function up() {
			var coord = this.selectedCoord;
			if (coord) {
				coord.west();
				if (this.pickedUpBlock) {
					this.pickedUpBlock.coord.west();
					this.pickedUpBlock.bob.update();
				}
			}
			this.updateCursor();
		};

		this.down = function down() {
			var coord = this.selectedCoord;
			if (coord) {
				coord.east();
				if (this.pickedUpBlock) {
					this.pickedUpBlock.coord.east();
					this.pickedUpBlock.bob.update();
				}
			}
			this.updateCursor();
		};

		this.left = function left() {
			var coord = this.selectedCoord;
			if (coord) {
				coord.north();
				if (this.pickedUpBlock) {
					this.pickedUpBlock.coord.north();
					this.pickedUpBlock.bob.update();
				}
			}
			this.updateCursor();
		};

		this.right = function right() {
			var coord = this.selectedCoord;
			if (coord) {
				coord.south();
				if (this.pickedUpBlock) {
					this.pickedUpBlock.coord.south();
					this.pickedUpBlock.bob.update();
				}
			}
			this.updateCursor();
		};


		this.actorOnStatus = null;
		// todo: can this be done better with a pubsub approach ?
		this.updateActorStatus = function updateActorStatus(actor) {
			if (actor === this.actorOnStatus) {
				this.setActorStatus(actor);
			}
		};
		this.setActorStatus = function setActorStatus(actor) {
			var i, letter, block, builder, type, coord, worldOptions;

			builder = this.world.builder;
			worldOptions = this.world.options();
			this.actorOnStatus = actor;

			// find and delete all block for the actorStatus group
			this.state.find({
				"class": "Block",
				group: "actorStatus"
			}).remove();

			// place a block for the character name
			coord = new Isomaton.Coord(worldOptions.width, 1, -2);
			for (i = 0; i < actor.label.length; i = i + 1) {
				letter = actor.label[i].toLowerCase();
				type = this.world.blockTypes["alphabet." + letter];
				block = new Isomaton.Block(type, coord, true, "actorStatus");
				this.placeBlocks([block]);
				coord.east();
				if (letter === "m" || letter === "w") coord.east();
			}


			// place a block for the character avatar
			type = actor.blockType;
			coord = new Isomaton.Coord(worldOptions.width, 1, -4);
			block = new Isomaton.Block(type, coord, true, "actorStatus");
			this.placeBlocks([block]);

			// place blocks for the character health
			for (i = 0; i < actor.life; i = i + 1) {
				coord.east();
				type = this.world.blockTypes["cursors.life"];
				block = new Isomaton.Block(type, coord, true, "actorStatus");
				this.placeBlocks([block]);
			}
		};

		this.slower = function slower() {
			if (this.speedMultiplier < 16) {
				jQuery.fx.off = false;
			}
			this.speedMultiplier = this.speedMultiplier / 2;
			if (this.speedMultiplier < 0.125) {
				this.speedMultiplier = 0.125;
			}
			// update the speed of the isograph
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
		};

		this.placeActors = function (actors) {
			var i;
			this.state.add(actors);
			for (i in actors) {
				if (actors[i].block) {
					this.state.add(actors[i].block);
				}
			}
		};

		/**
		 * Pause the game playback along with the sound. Also reduce the isograph FPS to lighten CPU load.
		 */
		this.pause = function pause() {
			this.playState = "pause";
			Ticker.setFPS(4);
			soundManager.pauseAll();
		};

		/**
		 * Resume the game playback along with sound. Also bring back the FPS to its normal setting.
		 */
		this.resume = function resume() {
			this.playState = "play";
			soundManager.resumeAll();
			// todo: get fps value from settings
			Ticker.setFPS(12);
		};

		/**
		 * Go through a single or multiple logicl step forward in game time
		 * @param stepCount The number of steps to do in a batch without applying a setTimout
		 */
		this.step = function step(stepCount) {
			var i, j, isValidMove, key, actor, actors, blocks, coord;
			for (i = 0; i < stepCount; i = i + 1) {
				// Increment the time marker by one
				stage.time = stage.time + 1;

				// Step through the stage logic
				stage._options.step.call(stage);

				// Obtain the collection of stage actors
				// todo: find a sexier way to access a class of actor in the state
				// like preset selectors ?
				// todo: rename .select to .find ?
				actors = this.state.find({"class": "Actor"});

				if (actors) {
					// Call the step handler of each actors
					for (j = 0; j < actors.length; j = j + 1) {
						actor = actors[j];
						actor.step();
					}

					// Call the go handler of each actors
					for (j = 0; j < actors.length; j = j + 1) {
						actor = actors[j];
						actor.go();
					}
				}

				// Update the fps counter (for debug usage)
				this.sps.update();
			}
			// Move to the next step
			this.nextStep(stepCount);
			return this;
		};

		/**
		 * Go through the next step event is the stage is paused or not.
		 * @param stepCount
		 */
		this.nextStep = function nextStep(stepCount) {
			// Step through the world options step (usually for debugging)
			this.world._options.step(this, this.world);

			// If not on pause call the next step after the required interval,
			// otherwise do the next check after 1 second
			if (stage.playState !== "pause") {
				setTimeout(function() {
					// Call the next step
					stage.step(stepCount);
				}, stage.speed / stage.speedMultiplier);
			} else {
				setTimeout(function() {
					// Check again in 1 second
					stage.nextStep(stepCount);
				}, 1000);
			}

			return this;
		};

		/**
		 * Cause an action to occur, possibly between one actor and another
		 * @param action
		 * @param actor
		 * @param subject
		 * @param options
		 */
		this.act = function act(action, actor, subject, options) {
			subject.publish("reaction-" + action, [actor, options]);
			return this;
		};

		/**
		 * Register a reaction to an eventual action, using a subscriber/publisher model.
		 * @param action
		 * @param subject
		 * @param handler
		 */
		this.react = function react(action, subject, handler) {
			subject.subscribe("reaction-" + action, function (actor, options) {
				handler.call(subject, actor, options);
			});
			return this;
		};


		this.init();
	};


})(Isomaton, jQuery, _);
