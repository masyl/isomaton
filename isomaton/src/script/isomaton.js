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
	- Actor add, remove, move (eventual attrs)
	- User actions


 */

(function IsomatonPackage($, _, undefined){

	window.isomaton = new Isomaton({
		World: World
	});

	function Isomaton(options) {
		/*
		Main constructors
		 */
		this.Block = Block;
		this.Area = Area;
		this.World = World;
		this.worlds = {}; // Collection of available worlds
		this.builder = {
			fill: fill,
			one: one,
			random: random,
			random4: random4
		};

		this.start = function start(options) {
			console.log("Starting!");
			var isograph, world;
			world = this.worlds[options.world];
			isograph = new Isomaton.Isograph({
				skin: options.skin,
				blockTypes: world.blockTypes,
				canvas: $("#isomaton").find("canvas.isograph")[0]
			});
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

	window.Isomaton = Isomaton;


	function World(options) {
		var world = this;
		/**
		 * Builder helper to easy the creation of block structures
		 */
		this.Actors = {};
		this.stages = {};
		this.currentStage = null;
		this.blockSets = {};
		this.blockTypes = {};
		this._options = {};

		this.init = function init() {
			this.options(options);
		};

		this.options = function fnOptions(_options) {
			var options, setId, blockSet, typeId;

			options = this._options;
			_(options).extend(_options);

			// If new blockSets are provided, Load the blockSet collections from the options
			if (_options && _options.blockSets) {
				for (setId in _options.blockSets) {
					blockSet = new BlockSet(setId, _options.blockSets[setId]);
					this.blockSets[setId] = blockSet;
					for (typeId in blockSet.blockTypes) {
						this.blockTypes[setId + "." + typeId] = blockSet.blockTypes[typeId];
					}
				}
			}
			return options;
		};

		this.random = fakeRandom;

		this.serializer = function serializer(json) {
			var obj = json || {};
			if (json) {
				// todo: deserialization
			} else {
				obj.currentStage = obj.currentStage.serializer()
			}
			return obj;
		};

		this.start = function start(_options) {
			var options = this.options(_options);
			console.log("Starting world...");
			var stage;
			world.currentStage = stage = this.stages[options.stage];
			this.bindKeyboard();
			console.log("Starting stage...");
			stage.start(this, {
				isograph: options.isograph
			});
		};

		this.save = function save() {
			var save = this.serializer();
			return save;
		};

		this.bindKeyboard = function bindKeyboard() {
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

	// Base class for blocks
	function Block(type, coord) {
		//todo: become a pubSub and publish on update to the miniDb for blocks
		this.id = _.uniqueId();
		this.type = type;
		this.coord = coord;
		this.nextCoord = null;
		this.prevCoord = null;
		this.direction = 0; // Direction thoward which the block is facing

		this.goNext = function goNext(coord) {
			this.nextCoord = coord;
		};

		this.go = function go(coord) {
			// todo: manage a better coord history queue
			if (this.nextCoord) {
				this.prevCoord = this.coord;
				this.coord = this.nextCoord;
				this.nextCoord = null;
			}
		};

		this.toString = function toString() {
			return "Block-" + this.id;
		};
		this.toIndex = function txoIndex() {
			return {
				"class": "Block",
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
		// todo: use an extend method instead of this idiotic approach...
		this.isSolid = this.isSolid = (options.isSolid !== undefined) ? options.isSolid : true;
		this.isAnimated = this.isAnimated = (options.isAnimated !== undefined) ? options.isAnimated : false;
		this.loop = this.loop = (options.loop !== undefined) ? options.loop : false;
		this.frames = this.frames = (options.frames !== undefined) ? options.frames : true;

		// true is this block has its own spritesheet
		this.hasOwnSpriteSheet = (options.hasOwnSpriteSheet !== undefined) ? options.hasOwnSpriteSheet : false;
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

	//todo: move into separate package
	Isomaton.Coord = function Coord(x, y, z) {
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

		this.copy = function copy() {
			return new Isomaton.Coord(this.x, this.y, this.z);
		};


		this.serializer = function serializer(json) {
			if (json) {

			} else {

			}
		};

		this.down = function down(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z - offset;
			return this;
		};

		this.up = function up(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z + offset;
			return this;
		};

		this.move = function move(direction, _offset) {
			var cardinalDirections;
			cardinalDirections = ["north", "east", "south", "west", "up", "down"];
			return this[cardinalDirections[direction]](_offset);
		};

		// todo: test if cardinal points are adressed correctly
		this.north = function north(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x + offset;
			return this;
		};

		this.east = function east(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y + offset;
			return this;
		};

		this.south = function south(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x - offset;
			return this;
		};

		this.west = function west(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y - offset;
			return this;
		};

		this.stepDistanceFrom = function stepDistanceFrom(coord) {
			return Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y);
		};

		this.directionsThoward = function directionsThoward(coord) {
			var directions = [];
			if (coord) {
				if (this.x > coord.x) {
					directions.push(2,2);
				} else if (this.x < coord.x) {
					directions.push(0,0);
				} else {
					directions.push(0, 2);
				}
				if (this.y > coord.y) {
					directions.push(3,3);
				} else if (this.y < coord.y) {
					directions.push(1,1);
				} else {
					directions.push(1, 3);
				}
			}
			return directions;
		};

		this.directionsAway = function directionsAway(coord) {
			var directions = [];
			if (coord) {
				if (this.x > coord.x) {
					directions.push(0);
				} else if (this.x < coord.x) {
					directions.push(2);
				} else {
					directions.push(0, 2);
				}
				if (this.y > coord.y) {
					directions.push(1);
				} else if (this.y < coord.y) {
					directions.push(3);
				} else {
					directions.push(1, 3);
				}
			}
			return directions;
		};

		// todo: function to turn clockwise and anti-clockwise
	};

	function Area(coord, width, height) {
		this.coord = coord;
		this.width = width;
		this.height = height;

		this.randomCoord = function randomCoord(seed) {
			var coord, newCoord, offsetX, offsetY;
			offsetX = Math.round(fakeRandom(seed, "offsetX") * (this.width-1));
			offsetY = Math.round(fakeRandom(seed, "offsetY") * (this.height-1));
			coord = this.coord;
			newCoord = new Isomaton.Coord(coord.x + offsetX, coord.y + offsetY, coord.z);
			return newCoord;
		};

		this.serializer = function serializer(json) {
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
		var blockCoord = new Isomaton.Coord(0, 0, 0);
		var x, y, z, block, blocks = [];
		for (x = coord.x; x < coord.x + area.width; x = x + 1) {
			for (y = coord.y; y < coord.y + area.height; y = y + 1) {
				blockCoord = new Isomaton.Coord(x, y, coord.z);
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

	function random4(seed, type, area, count) {
		var i, iSeed, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
			iSeed = i + seed + "" + i;
			coord = area.randomCoord(iSeed);
			block = new Block(type, coord);
			blocks.push(block);
			coord = coord.copy().north();
			block = new Block(type, coord);
			blocks.push(block);
			coord = coord.copy().east();
			block = new Block(type, coord);
			blocks.push(block);
			coord = coord.copy().south();
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

	//todo: place Rules in a separate package
	var Rules = Isomaton.Rules = {};
	Rules.CantWalkOnEmptyOrNonSolid = function CantWalkOnEmptyOrNonSolid(actor) {
		var coord, blocks, isValidMove, stage;
		isValidMove = true;
		coord = this.nextCoord;
		stage = this.stage;
		// Test if next move is a step on a solid block
		blocks = stage.blocks.select({
			"coord.x": coord.x,
			"coord.y": coord.y,
			"coord.z": coord.z - 1
		}).get();
		if (blocks.length) {
			// Stepping on non-solid
			//todo: handle case where multiple blocks occupy the same space
			if (!blocks[0].type.isSolid) {
				//console.log("stepping on non-solid!", blocks[0].type);
				isValidMove = false;
			}
		} else {
			// Stepping on empty
			isValidMove = false;
		}
		return isValidMove;
	};

	Rules.CantWalkIntoSolids = function CantWalkIntoSolids() {
		var coord, stage, blocks, isValidMove;
		isValidMove = true;
		// Test if next move is into a solid block
		coord = this.nextCoord;
		stage = this.stage;
		blocks = stage.blocks.select({
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
		blocks = stage.blocks.select({
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

		return isValidMove;
	};


})(jQuery, _);
