/*
Optimization:
	5 Entities
	40 fps animé
	80 fps sans anim
	145 fps sans render
	600 fps - no render, batched steps

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
(function TinycraftStagePackage(Tinycraft, $, _, undefined) {

	// todo: replace the registry with a subclass of minidb
	Tinycraft.Stage = function Stage(id, stageOptions) {
		var stage = this;

		this.blocks = [];
		this.registry = {
		};
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
				obj.entities = {};
				obj.blocks = {};
			}
			return obj;
		};

		//todo: not optimal... registry should be live
		this.updateRegistry = function updateRegistry() {
			this.registry = {};
			var i, key, block, entity, x, y, z;
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
			this.isograph.stepSpeed = this.speed;
			stageOptions.start.call(this);
			this.updateRegistry();
			this.render();
			stage.step(1);
		};

		this.render = function render() {
//			console.log("rendering");
			this.isograph.render();
		};

		this.placeBlocks = function (blocks) {
			var i, _blocks;
			_blocks = this.blocks;
			for (i in blocks) {
				_blocks.push(blocks[i]);
			}
			this.isograph.placeBlocks(blocks);
		};

		this.faster = function faster() {
			if (this.speedMultiplier > 16) {
				jQuery.fx.off = true;
			}
			this.speedMultiplier = this.speedMultiplier * 2;
		};

		this.slower = function slower() {
			if (this.speedMultiplier < 16) {
				jQuery.fx.off = false;
			}
			this.speedMultiplier = this.speedMultiplier / 2;
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

						// Test if next move is on a solid block
						key = entity.nextCoord.x + "-" + entity.nextCoord.y + "-" + (entity.nextCoord.z-1);
						registryEntry = stage.registry[key];
						if (registryEntry) {
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
						stage.isograph.animate(entity.block);
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

//			this.fps.update();
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


})(Tinycraft, jQuery, _);