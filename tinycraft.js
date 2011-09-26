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
		this.Isograph = Isograph;
		this.worlds = {}; // Collection of available worlds
		this.builder = {
			fill: fill,
			one: one,
			random: random
		};

		this.start = function(options) {
			console.log("Starting Tinycraft!");
			var isograph, world;
			isograph = new this.Isograph({
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
		this.speed = 100;
		this._options = {};

		this.init = function () {
			this.options(stageOptions);
		};

		this.options = function (_options) {
			_(this._options).extend(_options);
			return this._options;
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
			stageOptions.start.call(this);
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
				// todo: test for collisions with "nextCoord" or other blocks and entities
			}
			// Process all remaining nextCoord's as valid moves
			for (entityId in this.entities) {
				entity = this.entities[entityId];
				if (entity.nextCoord) {
					entity.coord = entity.nextCoord;
					entity.block.coord = entity.coord;
					entity.nextCoord = null;
				}
			}


			// Step through the world options step (usually debugging)
			world._options.step(stage, world);

			stage.render();

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

	function Isograph(options) {
		// todo: get texture image from options
		this._options = {};
		this.textures = options.spritesURL;
		this.blocks = [];

		this.init = function () {
			this.options(options);
		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.placeBlocks = function (blocks) {
			var
					i,
					_blocks = this.blocks;
			for (i in blocks) {
				_blocks.push(blocks[i]);
			}
		};

		this.translateFromISO = function (coord) {
			var newCoord;
			var skin = options.skin;
			newCoord = {
				x: (coord.y - coord.x) * skin.isoWidth,
				y: (coord.y + coord.x) * skin.isoTopHeight - (coord.z * skin.isoBlockHeight),
				z: coord.x + coord.y + coord.z
			};
			return newCoord;
		};

		this.render = function() {
			var i, blocks, $root, blockElement;
			blocks = this.blocks;
			// todo: get root target from options
			$root = $("#tinycraft");
			$root.empty();
			for (i in blocks) {
				blockElement = this.getElementFromBlock(blocks[i]);
				$root.append(blockElement);
			}
		};

		this.getElementFromBlock = function (block) {
			var skin, coord, element;
			skin = options.skin;
			coord = this.translateFromISO(block.coord);
			// todo: Get offsets depending on total stage width
			var offsetX = skin.stageOffsetX;
			var offsetY = skin.stageOffsetY;

			var bgOffsetX = -skin.spritesOffsetX - (block.type.offset * skin.spritesWidth);
			var bgOffsetY = -skin.spritesHeight;
			element = $("<div style='width: " + skin.isoSpriteWidth + "px; height: " + skin.isoSpriteHeight + "px; background-image: url(" + skin.spritesURL + "); background-position: " + bgOffsetX + "px " + bgOffsetY + "px; left:" + (coord.x + offsetX) + "; top:" + (coord.y + offsetY) + "; z-index:" + coord.z + "' class='block'>" + block.type.id + "</div>");
			return element;
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
		this.type = type;
		this.coord = coord;
		this.nextCoord = null;
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