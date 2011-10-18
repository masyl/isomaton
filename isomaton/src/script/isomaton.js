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
		this.actor = null; // The controlling actor of this block
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
					blockSet = new Isomaton.BlockSet(setId, _options.blockSets[setId]);
					this.blockSets[setId] = blockSet;
					for (typeId in blockSet.blockTypes) {
						this.blockTypes[setId + "." + typeId] = blockSet.blockTypes[typeId];
					}
				}
			}
			return options;
		};

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
			$(document).bind('keydown', 'esc', function(e) {
				e.preventDefault();
				var stage = world.currentStage;
				if (stage.playState !== "pause") {
					stage.pause();
				} else {
					stage.resume();
				}
			});
			$(document).bind('keydown', 'space', function(e) {
				e.preventDefault();
			});
			$(document).bind('keydown', '=', function(e) {
				e.preventDefault();
				world.currentStage.faster();
			});
			$(document).bind('keydown', '-', function(e) {
				e.preventDefault();
				world.currentStage.slower();
			});
			$(document).bind('keydown', 'up', function(e) {
				e.preventDefault();
				var block = world.currentStage.selectedBlock;
				if (block) {
					block.coord.west();
				}
				world.currentStage.updateSelectedBlock();
			});
			$(document).bind('keydown', 'down', function(e) {
				e.preventDefault();
				var block = world.currentStage.selectedBlock;
				if (block) {
					block.coord.east();
				}
				world.currentStage.updateSelectedBlock();
			});
			$(document).bind('keydown', 'right', function(e) {
				e.preventDefault();
				var block = world.currentStage.selectedBlock;
				if (block) {
					block.coord.south();
				}
				world.currentStage.updateSelectedBlock();
			});
			$(document).bind('keydown', 'left', function(e) {
				e.preventDefault();
				var block = world.currentStage.selectedBlock;
				if (block) {
					block.coord.north();
				}
				world.currentStage.updateSelectedBlock();
			});
			$(document).bind('keydown', 's', function(e) {
				e.preventDefault();
				var worldSave;
				worldSave = world.save();
				console.dir("worldSave: ", worldSave);
			});
		};

		this.random = Isomaton.fakeRandom;

		this.init();
	}

	function one(type, coord) {
		var block = new Isomaton.Block(type, coord);
		return [block];
	}

	function fill(type, area) {
		var coord = area.coord;
		var blockCoord = new Isomaton.Coord(0, 0, 0);
		var x, y, z, block, blocks = [];
		for (x = coord.x; x < coord.x + area.width; x = x + 1) {
			for (y = coord.y; y < coord.y + area.height; y = y + 1) {
				blockCoord = new Isomaton.Coord(x, y, coord.z);
				block = new Isomaton.Block(type, blockCoord);
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
				block = new Isomaton.Block(type, coord);
				blocks.push(block);
		}
		return blocks;
	}

	function random4(seed, type, area, count) {
		var i, iSeed, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
			iSeed = i + seed + "" + i;
			coord = area.randomCoord(iSeed);
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().north();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().east();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().south();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
		}
		return blocks;
	}

	Isomaton.fakeRandom = function fakeRandom(seed, key) {
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

	};

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
		var i, block, coord, stage, blocks, isValidMove;
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

		for (i = 0; i < blocks.length; i = i + 1) {
			block = blocks[i];
			if (block.type.isSolid && block !== this.block) {
				isValidMove = false;
				//console.log("invalid move");
			}
		}

		return isValidMove;
	};


})(jQuery, _);
