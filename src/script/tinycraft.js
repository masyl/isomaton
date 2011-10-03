/*
Actions are logged as transactions, but not reversible
State changes are reconstructer by starting from a checkpoint states and re-playing the transactions
All these state changes have the old and new value to enable reverse playback
Each world step can have any number of transactions, So each step much have a transaction/version number associated with it.
Even when playing the world forward, it should be relying on the same transactionnal model as when it moves backward

Fundamental questions:
- If the transaction log is present, is there a need to playback the business rules? Or is it just transactionnal state changes occuring?


Reversible Transactions:
	- Block add, remove, move
	- Entity add, remove, move (eventual attrs)
	- User actions


FIRST STEP:
	- Ability to serialize and deserialize a complete world/stage state
	- Make a predictable "save checkpoint" and "restart from checkpoint" to test world determinism

 */

(function ($, _, undefined){

	window.tinycraft = new Tinycraft({
		World: World
	});

	function Tinycraft(options) {
		/*
		Main constructors
		 */
		this.Block = Block;
		this.Coord = Coord;
		this.Area = Area;
		this.Stage = Stage;
		this.EntityType = EntityTypeFactory;
		this.World = World;
		this.worlds = {}; // Collection of available worlds
		this.builder = {
			fill: fill,
			one: one,
			random: random
		};

		this.start = function(options) {
			console.log("Starting!");
			var isograph, world;
			isograph = new Tinycraft.Isograph({
				skin: options.skin
			});
			world = this.worlds[options.world];
			world.start({
				isograph: isograph,
				stage: options.stage,
				step: options.step,
				root: options.root,
				width: options.width,
				height: options.height
			});
		}

	}

	window.Tinycraft = Tinycraft;


	function EntityTypeFactory (id, typeOptions) {
		function Entity(coord, options) {
			this.id = id;
			this._options = {};
			this.coord = coord;
			this.nextCoord = null;
			this.block = new Block(typeOptions.blockType, coord);

			this.label = "Anonymous";

			this.init = function () {
				this.options(typeOptions);
			};

			this.options = function (_options) {
				_(this._options).extend(_options);
				return this._options;
			};

			this.step = function (stage, world) {
				this._options.step.call(this, stage, world);
			};

			this.init();
		}
		return Entity;
	}

	function Stage(id, stageOptions) {
		this.blocks = [];
		this.registry = {
			// "x-y-x": {
			// 		blocks: []
			// 		entities: []
			// }
		};
		this.entities = [];
		this.spawnCoords = new Coord(0, 0, 1);
		this.isograph = null;
		this.time = 0;
		this.speed = 200;
		this._options = {};

		this.init = function () {
			this.options(stageOptions);
		};

		this.options = function (_options) {
			_(this._options).extend(_options);
			return this._options;
		};

		this.serializer = function (json) {
			if (json) {

			} else {

			}
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

		this.start = function(options) {
			this.options(options);
			this.isograph = options.isograph;
			this.isograph.stepSpeed = this.speed * 1;
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

		this.step = function (world) {
			var isValidMove, registryEntry, key, stage, entity, entityId;
			stage = this;

			stage.updateRegistry();

			stage.time = stage.time + 1;
			//console.log("_options: ", stage._options);

			// Step through the stage logic
			stage._options.step.call(stage, world);

			// Step through the entities logic
			for (entityId in this.entities) {
				this.entities[entityId].step(this, world);
			}

			// Test everyones move and see if there are collissions to resolve
			// or rules to apply
//			debugger;
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


			// Step through the world options step (usually debugging)
			world._options.step(stage, world);
//			console.time("stage.render");
			//stage.render();
//			console.timeEnd("stage.render");

			// call next step
			_.delay(function() {
				stage.step(world);
			}, stage.speed);
		};

		this.spawn = function (coord) {
			this.spawnCoord = coord;
		};

		this.init();
	}

	function World(options) {
		/**
		 * Builder helper to easy the creation of block structures
		 */
		this.entityTypes = {};
		this.stages = {};
		this.blockSets = {};
		this.blockTypes = {};
		this._options = {};

		this.init = function () {
			this.options(options);
		};

		this.options = function (_options) {
			var options, setId, blockSet, typeId;

			options = this._options;
			_(options).extend(_options);

			// Load the blockSet collections from the options
			for (setId in options.blockSets) {
				blockSet = new BlockSet(setId, options.blockSets[setId]);
				this.blockSets[setId] = blockSet;
				for (typeId in blockSet.blockTypes) {
					this.blockTypes[setId + "." + typeId] = blockSet.blockTypes[typeId];
				}
			}
			return options;
		};


		this.serializer = function (json) {
			if (json) {

			} else {

			}
		};

		this.start = function(_options) {
			var options = this.options(_options);
			console.log("Starting world...");
			var stage;
			stage = this.stages[options.stage];
			console.log("Starting stage...");
			stage.start({
				isograph: options.isograph
			});
			stage.step(this);
		};

		this.init();
	}

	function Block(type, coord) {
		this.id = _.uniqueId();
		this.type = type;
		this.coord = coord;
		this.nextCoord = null;

		this.toString = function () {
			return "Block-" + this.id;
		};
		this.toIndex = function () {
			return {
				"id": this.id,
				"type.id": this.type.id,
				"type.isSolid": this.type.isSolid,
				"coord.x": this.coord.x,
				"coord.y": this.coord.y,
				"coord.z": this.coord.z
			}
		};

		this.serializer = function (json) {
			if (json) {

			} else {

			}
		};
	}

	function BlockType(id, options) {
		this.id = id;
		this.offset = options.offset || 0;
		this.isSolid = options.isSolid || true;
	}

	function BlockSet(id, options) {
		var blockType, typeId;
		this.id = id;
		this.offset = options.offset;
		this.blockTypes = {};
		for (typeId in options.blocks) {
			blockType = new BlockType(typeId, options.blocks[typeId]);
			// Adjust the offset of the blockType with the offset of its set
			this.blockTypes[typeId] = blockType;
			blockType.offset = blockType.offset + this.offset;

		}
	}

	function Coord(x, y, z) {
		/*
		Directions:
			0: North
			1: East
			2: South
			3: West
			4: Up
			5: Down
		 */
		this.x = x;
		this.y = y;
		this.z = z;

		this.copy = function () {
			return new Coord(this.x, this.y, this.z);
		};


		this.serializer = function (json) {
			if (json) {

			} else {

			}
		};

		this.down = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z - offset;
			return this;
		};

		this.up = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z + offset;
			return this;
		};

		this.move = function (direction, _offset) {
			var cardinalDirections;
			cardinalDirections = ["north", "east", "south", "west", "up", "down"];
			return this[cardinalDirections[direction]](_offset);
		};

		// todo: test if cardinal points are adressed correctly
		this.north = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x + offset;
			return this;
		};

		this.east = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y + offset;
			return this;
		};

		this.south = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x - offset;
			return this;
		};

		this.west = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y - offset;
			return this;
		};

		// todo: function to turn clockwise and anti-clockwise
	}

	function Area(coord, width, height) {
		this.coord = coord;
		this.width = width;
		this.height = height;

		this.randomCoord = function () {
			var coord, newCoord, offsetX, offsetY;
			offsetX = Math.round(Math.random() * (this.width-1));
			offsetY = Math.round(Math.random() * (this.height-1));
			coord = this.coord;
			newCoord = new Coord(coord.x + offsetX, coord.y + offsetY, coord.z);
			return newCoord;
		}

		this.serializer = function (json) {
			if (json) {

			} else {

			}
		};
	}

	function one(type, coord) {
		var block = new Block(type, coord);
		return [block];
	}

	function fill(type, area) {
		var coord = area.coord;
		var blockCoord = new Coord(0, 0, 0);
		var x, y, z, block, blocks = [];
		for (x = coord.x; x < coord.x + area.width; x = x + 1) {
			for (y = coord.y; y < coord.y + area.height; y = y + 1) {
				blockCoord = new Coord(x, y, coord.z);
				block = new Block(type, blockCoord);
				blocks.push(block);
			}
		}
		return blocks;
	}

	function random(type, area, count) {
		var i, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
				coord = area.randomCoord();
				block = new Block(type, coord);
				blocks.push(block);
		}
		return blocks;
	}

})(jQuery, _);