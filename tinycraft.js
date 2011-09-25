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
		this.Entity = Entity;
		this.World = World;
		this.Isograph = Isograph;

		this.worlds = {}; // Collection of available worlds

		this.builder = {
			fill: fill,
			one: one,
			random: random
		};

		this.start = function(options) {
			console.log("starting!");
			var isograph, world;
			isograph = new this.Isograph();
			world = this.worlds[options.world];
			world.start({
				isograph: isograph,
				stage: options.stage
			});
		}

	}


	function Entity(id, options) {

	}

	function Stage(id, stageOptions) {
		this.blocks = [];
		this.spawnCoords = new Coord(0, 0, 1);
		this.isograph = null;

		this.start = function(options) {
			this.isograph = options.isograph;
			stageOptions.start.call(this);
		};

		this.render = function() {
			console.log("rendering");
			this.isograph.render();
		};

		this.place = function (blocks) {
			var
					i,
					_blocks = this.blocks;
			for (i in blocks) {
				_blocks.push(blocks[i]);
			}
			this.isograph.place(blocks);
		};

		this.spawn = function (coord) {
			this.spawnCoord = coord;
		};
	}

	function Isograph() {
		this.textures = "tinycraft-2x.png";
		this.blocks = [];

		this.place = function (blocks) {
			var
					i,
					_blocks = this.blocks;
			for (i in blocks) {
				_blocks.push(blocks[i]);
			}
		};

		this.render = function() {
			var i, blocks, $root, blockElement;
			blocks = this.blocks;
			$root = $("#tinycraft");
			console.log("flushing graph");
			$root.empty();
			console.log("rendering dom elements");
			for (i in blocks) {
				blockElement = this.getElementFromBlock(blocks[i]);
				$root.append(blockElement);
			}
		};

		this.getElementFromBlock = function (block) {
			var coord, element;
			coord = block.coord.translate();
			var offsetX = 500;
			var offsetY = 0;
			var bgOffsetX = -10 - (block.type.offset * 80);
			var bgOffsetY = -16;
			element = $("<div style='background-position: " + bgOffsetX + "px " + bgOffsetY + "px; left:" + (coord.x + offsetX) + "; top:" + (coord.y + offsetY) + "; z-index:" + coord.z + "' class='block'>" + block.type + "</div>");
			return element;
		}
	}

	function World(options) {
		/**
		 * Builder helper to easy the creation of block structures
		 */
		this.entities = {};
		this.stages = {};
		this.blockSets = {};
		this.blockTypes = {};

		this.init = function () {
			this.options(options);
		};

		this.options = function (options) {
			var setId, blockSet, typeId, typeId;

			// Load the blockSet collections from the options
			for (setId in options.blockSets) {
				blockSet = new BlockSet(setId, options.blockSets[setId]);
				this.blockSets[setId] = blockSet;
				for (typeId in blockSet.blockTypes) {
					this.blockTypes[setId + "." + typeId] = blockSet.blockTypes[typeId];
				}
			}
		};
		this.start = function(options) {
			console.log("Starting world...");
			var stage;
			stage = this.stages[options.stage];
			console.log("Starting stage...");
			stage.start({
				isograph: options.isograph
			});
			stage.render();
		};

		this.init();
	}

	function Block(type, coord) {
		this.type = type;
		this.coord = coord;
	}

	function BlockType(id, options) {
		this.id = id;
		this.offset = options.offset || 0;
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
		this.x = x;
		this.y = y;
		this.z = z;
		this.down = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z - offset;
		};
		this.up = function (_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z + offset;
		};
		this.translate = function() {
			var
					coord,
					width = 28,
					topHeight = 14,
					blockHeight = 34;
			coord = {
				x: (this.y - this.x) * width,
				y: (this.y + this.x) * topHeight - (this.z * blockHeight),
				z: x + y + z
			};
			return coord;
		}
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
		console.log("placing random blocs: ", blocks, count);
		return blocks;
	}

})(jQuery, _);