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

		this.fps = {
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
					url: "../../sounds/Nurykabe-Arrivee-distante.ogg"
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

		this.pause = function pause() {
			this.playState = "pause";
		};

		this.resume = function resume() {
			this.playState = "play";
		};

		/**
		 * Go through a single or multiple logicl step forward in game time
		 * @param stepCount The number of steps to do in a batch without applying a setTimout
		 */
		this.step = function step(stepCount) {
			var isValidMove, key, actor, actorId, actors, blocks, coord;
			for (var i = 0; i < stepCount; i = i + 1) {

				stage.time = stage.time + 1;
				//console.log("_options: ", stage._options);

				// Step through the stage logic
				stage._options.step.call(stage);

				// Step through the actor logic
				actors = this.actors.all().get();

				// Call the step of each actors
				for (actorId in actors) {
					actor = actors[actorId];
					//todo: no nead to pass the stage as argument if it is aware of what stage it is on
					actor.step(this);
					actor.validateMove(this);
				}
/*
				// Test everyones move and see if there are collissions to resolve or rules to apply
				for (actorId in actors) {
					actor = actors[actorId];
					// Ask actor to validate it's next move
					//todo: no nead to pass the stage as argument if it is aware of what stage it is on
//					actor.validateMove(this);
				}
*/
				
				// Process all remaining nextCoord's as valid moves
				for (actorId in actors) {
					actor = actors[actorId];

					if (actor.nextCoord) {
						actor.go();
						// Update the actor and block indexes in the minidb
						// todo: use pubsub for updates ... should not update all blocks in batch
//						this.blocks.update(actor.block);
//						this.actors.update(actor);
					}
				}

				this.fps.update();
			}
			this.nextStep(stepCount);

			return this;
		};

		/**
		 * Go through the next step event is the stage is paused or not.
		 */
		this.nextStep = function nextStep(stepCount) {
			// Step through the world options step (usually debugging)
			this.world._options.step(this, this.world);

			setTimeout(function() {
				if (stage.playState !== "pause") {
					stage.step(stepCount);
				} else {
					stage.nextStep(stepCount);
				}
			}, stage.speed / stage.speedMultiplier);

			return this;
		};

		this.act = function act(action, actor, subject, options) {
			subject.publish("reaction-" + action, [actor, options]);
			return this;
		};

		this.react = function react(action, subject, handler) {
			subject.subscribe("reaction-" + action, function (actor, options) {
				handler.call(subject, actor, options);
			});
			return this;
		};


		this.init();
	};


})(Isomaton, jQuery, _);
