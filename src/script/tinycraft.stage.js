
(function (Tinycraft, $, _, undefined){

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

		this.init = function () {
			this.options(stageOptions);
		};

		this.options = function (_options) {
			_(this._options).extend(_options);
			return this._options;
		};

		this.random = function (key) {
			return this.world.random(this.time, key);
		};

		this.randomItem = function(key, items) {
			var i;
			i = parseInt((this.random(key)) * (items.length));
			return items[i];
		};

		this.serializer = function (json) {
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
		this.updateRegistry = function () {
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

		this.start = function(world, options) {
			this.world = world;
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed;
			stageOptions.start.call(this);
			this.updateRegistry();
			this.render();
		};

		this.render = function() {
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

		this.faster = function () {
			this.speedMultiplier = this.speedMultiplier * 2;
		};

		this.slower = function () {
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

		this.pause = function () {
			this.playState = "pause";
		};

		this.resume = function () {
			this.playState = "play";
		};

		this.step = function () {
			var isValidMove, registryEntry, key, entity, entityId;

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


			this.nextStep();
		};

		/**
		 * Go through the next step event is the stage is paused or not.
		 */
		this.nextStep = function () {
			// Step through the world options step (usually debugging)
			this.world._options.step(stage, this.world);

			_.delay(function() {
				if (stage.playState !== "pause") {
					stage.step();
				} else {
					stage.nextStep();
				}
			}, stage.speed / stage.speedMultiplier);
		};

		this.init();
	};


})(Tinycraft, jQuery, _);