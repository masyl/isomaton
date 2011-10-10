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

		this.blocks = [];
		this.registry = {};
		this.entities = [];
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

		//todo: not optimal... registry should be live
		this.updateRegistry = function updateRegistry() {
			var i, key, block, entity, x, y, z;
			//flush the registry
			for (i in this.registry) {
				delete this.registry[i];
			}
			for (i in this.blocks) {
				block = this.blocks[i];
				x = block.coord.x;
				y = block.coord.y;
				z = block.coord.z;
				key = x + "-" + y + "-" + z;
				if (!this.registry[key]) this.registry[key] = new RegistryEntry(key, block.coord);
				this.registry[key].blocks.push(block);
			}

			for (i in this.entities) {
				entity = this.blocks[i];
				x = entity.coord.x;
				y = entity.coord.y;
				z = entity.coord.z;
				key = x + "-" + y + "-" + z;
				if (!this.registry[key]) this.registry[key] = new RegistryEntry(key, entity.coord);
				this.registry[key].entities.push(entity);
				this.registry[key].blocks.push(entity.block);
			}

			for (i in this.entities) {
				entity = this.blocks[i];
				if (entity.nextCoord) {
					x = entity.nextCoord.x;
					y = entity.nextCoord.y;
					z = entity.nextCoord.z;
					key = "next-" + x + "-" + y + "-" + z;
					if (!this.registry[key]) this.registry[key] = new RegistryEntry(key, entity.coord);
					this.registry[key].entities.push(entity);
					this.registry[key].blocks.push(entity.block);
				}
			}

			function RegistryEntry(key, coord) {
				this.key = key;
				this.coord = coord;
				this.blocks = [];
				this.entities = [];
			}
			//console.log("registry updated", this.registry);
		};

		this.start = function start(world, options) {
			this.world = world;
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed / this.speedMultiplier;
			stageOptions.start.call(this);
			this.updateRegistry();
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
			this.updateRegistry();
		};

		this.placeBlocks = function placeBlocks(blocks) {
			var i, newBlocks, newBlock, existingBlocks, mode, key;
			newBlocks = this.blocks;
			mode = this.editMode().value();
			window.registry = this.registry;
			for (i in blocks) {
				newBlock = blocks[i];
				if (mode === editModes.emptyFirst) {
					key = newBlock.coord.x + "-" + newBlock.coord.y + "-" + newBlock.coord.z;
					existingBlocks = this.registry[key]; // todo: use minidb
					if (existingBlocks && existingBlocks.blocks) {
						this.isograph.removeBlocks(existingBlocks.blocks);
						this.removeBlocks(existingBlocks.blocks);
					}
				}
				stage.updateRegistry(); // todo: remove this costly request by using minidb
				newBlocks.push(newBlock);
			}
			this.isograph.placeBlocks(blocks);
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
			var i, entity, _entities;
			_entities = this.entities;
			for (i in entities) {
				entity = entities[i];
				_entities.push(entity);
				if (entity.block) {
					this.isograph.placeBlocks([entity.block]);
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
			var isValidMove, registryEntry, key, entity, entityId;
			for (var i = 0; i < stepCount; i = i + 1) {
				stage.updateRegistry();

				stage.time = stage.time + 1;
				//console.log("_options: ", stage._options);

				// Step through the stage logic
				stage._options.step.call(stage);

				// Step through the entities logic
				for (entityId in this.entities) {
					this.entities[entityId].step(this);
				}

				stage.updateRegistry();
				console.log(stage.registry);

				// Test everyones move and see if there are collissions to resolve
				// or rules to apply
				for (entityId in this.entities) {
					isValidMove = true;
					entity = this.entities[entityId];

					// todo: make rules specific to each actors
					// a bird or fish doesnt move with the same rules as
					// an ordinary knight!

					if (entity.nextCoord) {
						// Test if next move is into a solid block
						key = entity.nextCoord.x + "-" + entity.nextCoord.y + "-" + entity.nextCoord.z;
						registryEntry = stage.registry[key];
						if (registryEntry) {
							if (registryEntry.blocks[0].type.isSolid) {
								isValidMove = false;
							}
						}

						// Test if next move is into a space that WILL be occupied by a solid block
						key = "next-" + entity.nextCoord.x + "-" + entity.nextCoord.y + "-" + entity.nextCoord.z;
						registryEntry = stage.registry[key];
						if (registryEntry) {
							console.log("COLISION: ", registryEntry);
							if (registryEntry.blocks[0].type.isSolid) {
								isValidMove = false;
							}
						}

						// Test if next move is a step on a solid block
						key = entity.nextCoord.x + "-" + entity.nextCoord.y + "-" + (entity.nextCoord.z-1);
						registryEntry = stage.registry[key];
						if (registryEntry && registryEntry.blocks) {
							if (!registryEntry.blocks[0].type.isSolid) {
								isValidMove = false;
							}
						} else {
							isValidMove = false;
						}

						if (!isValidMove) {
							entity.nextCoord = null;
						}
					}
					// todo: test for collisions with "nextCoord" or other blocks and entities
				}
				// Process all remaining nextCoord's as valid moves
				for (entityId in this.entities) {
					entity = this.entities[entityId];
					if (entity.nextCoord) {
						entity.coord = entity.nextCoord;
						entity.block.coord = entity.coord;
						stage.isograph.updateBlock(entity.block);
						entity.nextCoord = null;
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