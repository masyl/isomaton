/*
Optimization:
BASE
	5 Entities
	40 fps animé
	80 fps sans anim
	145 fps sans render
	600 fps - no render, batched steps

NEW
	5 Entities
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
		emptyFirst: "emptyFirst"
	};
	// todo: constants for playStates (rename to playbackMode ?  rewind, play, pause, or just an integer ?

	
	// todo: replace the registry with a subclass of minidb
	Isomaton.Stage = function Stage(id, stageOptions) {

		var
				stage = this, // Self reference used inside deeper closures
				_editMode; // The current edit mode when placing blocks and entities

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
		this.entities =  new Minidb();
		this.world = null;
		this.isograph = null;
		this.time = 0;
		this.speed = 200;
		this.speedMultiplier = 1;
		this._options = {};
		this.playState = "pause";
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
				obj.entities = {};
				obj.blocks = {};
			}
			return obj;
		};

		this.start = function start(world, options) {
			this.world = world;
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
			this.isograph.bind(this.blocks);
			stageOptions.start.call(this);
			this.render();
			stage.step(1);
		};

		this.render = function render() {
			this.isograph.setup();
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

		this.placeEntities = function (entities) {
			var i;
			this.entities.add(entities);
			for (i in entities) {
				if (entities[i].block) {
					this.blocks.add(entities[i].block);
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
			var isValidMove, key, entity, entityId, entities, blocks, coord;
			for (var i = 0; i < stepCount; i = i + 1) {

				stage.time = stage.time + 1;
				//console.log("_options: ", stage._options);

				// Step through the stage logic
				stage._options.step.call(stage);

				// Step through the entities logic
				entities = this.entities.all().get();

				// Call the step of each entities
				for (entityId in entities) {
					entities[entityId].step(this);
				}

				// Test everyones move and see if there are collissions to resolve
				// or rules to apply
				for (entityId in entities) {
					isValidMove = true;
					entity = entities[entityId];

					// todo: make rules specific to each actors
					// a bird or fish doesnt move with the same rules as
					// an ordinary knight!
					if (entity.nextCoord) {

						// Test if next move is into a solid block
						coord = entity.nextCoord;
						blocks = this.blocks.select({
							"coord.x": coord.x,
							"coord.y": coord.y,
							"coord.z": coord.z
						}).get();
						if (blocks.length) {
							//todo: handle case where multiple blocks occupy the same space
							if (blocks[0].type.isSolid) {
								isValidMove = false;
							}
						}


						// Test if next move is into a space that WILL be occupied by a solid block
						blocks = this.blocks.select({
							"nextCoord.x": coord.x,
							"nextCoord.y": coord.y,
							"nextCoord.z": coord.z
						}).get();
						if (blocks.length) {
							//console.log("collision");
							//todo: handle case where multiple blocks occupy the same space
							if (blocks[0].type.isSolid) {
								isValidMove = false;
							}
						}

						// Test if next move is a step on a solid block
						blocks = this.blocks.select({
							"coord.x": coord.x,
							"coord.y": coord.y,
							"coord.z": coord.z - 1
						}).get();
						if (blocks.length) {
							//todo: handle case where multiple blocks occupy the same space
							if (!blocks[0].type.isSolid) {
								//console.log("stepping on non-solid!", blocks[0].type);
								isValidMove = false;
							}
						} else {
							//console.log("stepping on air!");
							isValidMove = false;
						}

						// Invalidate the move if necessary
						if (!isValidMove) {
							entity.nextCoord = null;
						}
					}
					// todo: test for collisions with "nextCoord" or other blocks and entities
				}
				// Process all remaining nextCoord's as valid moves
				for (entityId in entities) {
					entity = entities[entityId];
					if (entity.nextCoord) {
						entity.coord = entity.nextCoord;
						entity.block.coord = entity.coord;
						entity.nextCoord = null;
						// Update the entity and block in the minidb
						this.blocks.update(entity.block);
						this.entities.update(entity);
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

		this.init();
	};


})(Isomaton, jQuery, _);