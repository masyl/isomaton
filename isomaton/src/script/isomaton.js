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

		this.start = function start(options) {
			console.log("Starting!");
			var isograph, world;
			world = this.worlds[options.world];
			isograph = new Isomaton.Isograph({
				skin: options.skin,
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
					for (typeId in blockSet.blockTypes) {
						Isomaton.Blocks[setId + "." + typeId] = blockSet.blockTypes[typeId];
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
			$(document).bind('keydown', 'p', function(e) {
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
				world.currentStage.cursorAct();
			});
			$(document).bind('keydown', 'esc', function(e) {
				e.preventDefault();
				world.currentStage.cursorRelease();
			});
			$(document).bind('keydown', 'o', function(e) {
				e.preventDefault();
				world.currentStage.faster();
			});
			$(document).bind('keydown', 'i', function(e) {
				e.preventDefault();
				world.currentStage.slower();
			});
			$(document).bind('keydown', 'up', function(e) {
				e.preventDefault();
				world.currentStage.up();
			});
			$(document).bind('keydown', 'down', function(e) {
				e.preventDefault();
				world.currentStage.down();
			});
			$(document).bind('keydown', 'right', function(e) {
				e.preventDefault();
				world.currentStage.right();
			});
			$(document).bind('keydown', 'left', function(e) {
				e.preventDefault();
				world.currentStage.left();
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

	Isomaton.Blocks = {};

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


})(jQuery, _);
