/*

- Make the chickens "not" react on cursor presence

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
					multiShot: true,
					volume: 0
				});
				sounds.chicken = soundManager.createSound({
					autoLoad: true,
					id:'chicken',
					url: "../../sounds/chicken.ogg",
					multiShot: true,
					volume: 0
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
			this.isograph.setup(this.state, onSetup);
			this.isograph.subscribe("blockSelect", function(block) {
				stage.onBlockSelected(block);
			});

			function onSetup() {
				// todo: find a better way than calling from options
				stageOptions.start.call(stage);
				stage.step(1);
				// Find the cursor actor
				var cursor = stage.state.find({
					"class": "Actor",
					"type": "cursor"
				}).first();
				stage.cursor(cursor);
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

		this.actorSelect = function actorSelect(actor) {
			this.setActorStatus(actor);
		};

		this._cursor = null;
		this.cursor = function cursor(cursor) {
			if (cursor) {
				stage._cursor = cursor;
			}
			return stage._cursor;
		};

		this.up = function up() {
			var cursor = this.cursor();
			if (cursor) {
				cursor.goNext(cursor.coord.north()).go();
			}
		};

		this.down = function down() {
			var cursor = this.cursor();
			if (cursor) {
				cursor.goNext(cursor.coord.south()).go();
			}
		};

		this.left = function left() {
			var cursor = this.cursor();
			if (cursor) {
				cursor.goNext(cursor.coord.west()).go();
			}
		};

		this.right = function right() {
			var cursor = this.cursor();
			if (cursor) {
				cursor.goNext(cursor.coord.east()).go();
			}
		};

		this.cursorAct = function act() {
			var cursor = this.cursor();
			if (cursor) {
				// Cursor call "activate" upon himself
				cursor.act("activate", cursor);
			}
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
			Ticker.setFPS(8);
			soundManager.pauseAll();
		};

		/**
		 * Resume the game playback along with sound. Also bring back the FPS to its normal setting.
		 */
		this.resume = function resume() {
			this.playState = "play";
			soundManager.resumeAll();
			// todo: get fps value from settings
			Ticker.setFPS(15);
		};

		/**
		 * Go through a single or multiple logicl step forward in game time
		 * @param stepCount The number of steps to do in a batch without applying a setTimout
		 */
		this.step = function step(stepCount) {
			var i, j, isValidMove, key, actor, actors, block, blocks, coord;
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

				// Update the step per second counter (for debug usage)
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
