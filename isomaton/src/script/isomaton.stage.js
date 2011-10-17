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

		var
				stage = this, // Self reference used inside deeper closures
				_editMode; // The current edit mode when placing blocks and actors

		var _value;
		this.value = function(newValue, oldValue) {
			if (newValue !== undefined) {
				_value = (newValue === undefined) ? oldValue : newValue;
			}
			return _value;
		};

		// todo: use a factory to create such functionnal getter/setters
		this.editMode = function (editMode) {
			_editMode = this.value(editMode, _editMode);
			return this;
		};

		this.blocks =  new Minidb();
		this.actors =  new Minidb();
		this.world = null;
		this.isograph = null;
		this.time = 0;
		this.speed = 200;
		this.speedMultiplier = 1;
		this._options = {};
		this.playState = "play";

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
			this
					.editMode(editModes.emptyFirst)
					.options(stageOptions);
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

			var sounds = stage.sounds = {};
			soundManager.url = '../src/libs/soundmanager-297a/swf/';
			soundManager.debugMode = false;
			soundManager.flashVersion = 9; // optional: shiny features (default = 8)
			soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
			soundManager.useHTML5Audio = true;
			soundManager.onready(function() {
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
					multiShot: true
				});

			});

			this.world = world;
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
			this.isograph.setup(onSetup);
			this.isograph.bind(this.blocks);

			function onSetup() {
				// todo: find a better way than calling from options
				stageOptions.start.call(stage);
				stage.step(1);
			}
		};

		//todo: Blocks collections/container should have this method instead of this procedural approach
		this.removeBlocks = function removeBlocks(blocks) {
			_(blocks).each(function (block) {
				var index = _(stage.blocks).indexOf(block);
				stage.blocks.splice(index, 1);
			});
		};

		this.placeBlocks = function placeBlocks(blocks) {
			var i, newBlocks, newBlock, coord, existingBlocks, mode, key, removed;
			newBlocks = this.blocks;
			mode = this.editMode().value();
			window.blocks = this.blocks;
			for (i in blocks) {
				newBlock = blocks[i];
				coord = newBlock.coord;
				if (mode === editModes.emptyFirst) {
					removed = this.blocks
							.select({
								"coord.x": coord.x,
								"coord.y": coord.y,
								"coord.z": coord.z
							})
							.remove()
							.get();
					if (coord.z === 0) {
//						console.log("placing blocks", blocks);
					}
					if (removed.length) {
//						console.log("removed: empty first: ",  removed);
					}
				}
				this.blocks.add(newBlock);
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

		this.actorOnStatus = null;
		// todo: can this be done better with a pubsub approach ?
		this.updateActorStatus = function updateActorStatus(actor) {
			if (actor === this.actorOnStatus) {
				this.setActorStatus(actor);
			}
		};
		this.setActorStatus = function setActorStatus(actor) {
			var i, letter, block, oldBlocks, builder, type, coord, worldOptions;

			builder = this.world.builder;
			worldOptions = this.world.options();
			this.actorOnStatus = actor;

			// find and delete all block for the actorStatus group
			oldBlocks = this.blocks.select({
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
			this.actors.add(actors);
			for (i in actors) {
				if (actors[i].block) {
					this.blocks.add(actors[i].block);
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
			var isValidMove, key, actor, actorId, actors, blocks, coord;
			for (var i = 0; i < stepCount; i = i + 1) {
				// Increment the time marker by one
				stage.time = stage.time + 1;

				// Step through the stage logic
				stage._options.step.call(stage);

				// Obtain the collection of stage actors
				actors = this.actors.all().get();

				// Call the step handler of each actors
				for (actorId in actors) {
					actor = actors[actorId];
					actor.step();
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
