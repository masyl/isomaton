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
		this.Area = Area;
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

	function World(options) {
		var world = this;
		/**
		 * Builder helper to easy the creation of block structures
		 */
		this.entityTypes = {};
		this.stages = {};
		this.currentStage = null;
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

		this.random = fakeRandom;

		this.serializer = function (json) {
			var obj = json || {};
			if (json) {
				// todo: deserialization
			} else {
				obj.currentStage = obj.currentStage.serializer()
			}
			return obj;
		};

		this.start = function(_options) {
			var options = this.options(_options);
			console.log("Starting world...");
			var stage;
			world.currentStage = stage = this.stages[options.stage];
			this.bindKeyboard();
			console.log("Starting stage...");
			stage.start(this, {
				isograph: options.isograph
			});
			stage.step(this);

		};

		this.save = function () {
			var save = this.serializer();
			return save;
		};

		this.bindKeyboard = function () {
			$(document).bind('keydown', 'space', function(e) {
				e.preventDefault();
				var stage = world.currentStage;
				if (stage.playState !== "pause") {
					stage.pause();
				} else {
					stage.resume();
				}
			});
			$(document).bind('keydown', 'right', function(e) {
				e.preventDefault();
				world.currentStage.faster();
			});
			$(document).bind('keydown', 'left', function(e) {
				e.preventDefault();
				world.currentStage.slower();
			});
			$(document).bind('keydown', 's', function(e) {
				e.preventDefault();
				var worldSave;
				worldSave = world.save();
				console.dir("worldSave: ", worldSave);
			});
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

	Tinycraft.Coord = function Coord(x, y, z) {
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
			return new Tinycraft.Coord(this.x, this.y, this.z);
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
	};

	function Area(coord, width, height) {
		this.coord = coord;
		this.width = width;
		this.height = height;

		this.randomCoord = function (seed) {
			var coord, newCoord, offsetX, offsetY;
			offsetX = Math.round(fakeRandom(seed, "offsetX") * (this.width-1));
			offsetY = Math.round(fakeRandom(seed, "offsetY") * (this.height-1));
			coord = this.coord;
			newCoord = new Tinycraft.Coord(coord.x + offsetX, coord.y + offsetY, coord.z);
			return newCoord;
		};

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
		var blockCoord = new Tinycraft.Coord(0, 0, 0);
		var x, y, z, block, blocks = [];
		for (x = coord.x; x < coord.x + area.width; x = x + 1) {
			for (y = coord.y; y < coord.y + area.height; y = y + 1) {
				blockCoord = new Tinycraft.Coord(x, y, coord.z);
				block = new Block(type, blockCoord);
				blocks.push(block);
			}
		}
		return blocks;
	}

	function random(seed, type, area, count) {
		var i, iSeed, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
				iSeed = i + seed + "" + i;
				coord = area.randomCoord(iSeed);
				block = new Block(type, coord);
				blocks.push(block);
		}
		return blocks;
	}

	function fakeRandom(seed, key) {
		// todo: make better handling of key to prevent accidental duplicate results
		var rnd, i;
		rnd = (seed || 1) * Math.PI;
		if (key) {
			for (i = 0; i < key.length; i = i + 1) {
				rnd = rnd * Math.PI * key.charCodeAt(i);
				rnd = rnd - parseInt(rnd);
			}
		}
		//console.log(rnd, seed, rnd, key);
		return rnd;

	}
})(jQuery, _);