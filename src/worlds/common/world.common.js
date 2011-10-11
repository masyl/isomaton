(function (isomaton, Isomaton){

	var world = isomaton.worlds.common = new isomaton.World(window.commonworld);

	var Coord = Isomaton.Coord;
	var Area = isomaton.Area;
	var Rules = Isomaton.Rules;
	var builder = isomaton.builder;

	var editModes = Isomaton.editModes;


	function Actor(coord, options) {
		this.id = "blank";
		this._options = {};
		this.coord = coord;
		this.nextCoord = null;
		this.block = null;
		this.label = "Blank";

		this.movementRules = [
			Rules.CantWalkOnEmptyOrNonSolid,
			Rules.CantWalkIntoSolids
		];

		this.validateMove = function (stage) {
			var i, rule, isValid;
			isValid = true;
			if (this.nextCoord) {
//				console.log(this.movementRules);
				for (i = 0; i < this.movementRules; i = i + 1) {
					isValid = this.movementRules[i].call(stage, this);
					if (!isValid) break;
				}
				if (!isValid) {
					this.nextCoord = null;
				}
			}
		};

		this.blockType = world.blockTypes["blank.blank"];

		this.init = function init() {
			this.block = new isomaton.Block(this.blockType, coord);
		};

		this.options = function fnOptions(_options) {
			_(this._options).extend(_options);
			return this._options;
		};

		this.toString = function toString() {
			return "Actor-" + this.id;
		};

		this.toIndex = function txoIndex() {
			var index;
			index = {
				"class": "Actor",
				"id": this.id,
				"coord.x": this.coord.x,
				"coord.y": this.coord.y,
				"coord.z": this.coord.z
			};
			if (this.nextCoord) {
				index["nextCoord.x"] = this.nextCoord.x;
				index["nextCoord.y"] = this.nextCoord.y;
				index["nextCoord.z"] = this.nextCoord.z;
			}
			return index;
		};

		this.step = function step(stage) {
			/* you super class should contain the actors behavior */
		};
	}

	world.Actors.Slime = function Slime(coord, options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.id = "slime";
		this.label = "Slime";
		this.blockType = world.blockTypes["actors.slime"];
		this.step = function slimeStep(stage) {
			var mod = stage.time % 8;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.block.direction = direction;
				this.nextCoord = this.coord.copy().move(direction);
			}
		};
		this.init();
	};


	world.Actors.Chicken = isomaton.Actor("chicken", {
		label: "Chicken",
		blockType: world.blockTypes["actors.chicken"],
		step: function chickenStep(stage) {
			var mod = stage.time % 8;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.block.direction = direction;
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});


	world.Actors.Knight = isomaton.Actor("knight", {
		label: "Knight",
		blockType: world.blockTypes["actors.knight"],
		step: function knightStep(stage) {
			var mod = stage.time % 4;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.block.direction = direction;
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.Actors.Sidekick = isomaton.Actor("sidekick", {
		label: "Sidekick",
		blockType: world.blockTypes["actors.sidekick"],
		step: function sidekickStep(stage) {
			var mod = stage.time % 3;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.block.direction = direction;
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.Actors.Princess = isomaton.Actor("princess", {
		label: "Princess",
		blockType: world.blockTypes["actors.princess"],
		step: function princessStep(stage) {
			// Move at random
			var mod = stage.time % 6;
			if (mod === 0) {
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.block.direction = direction;
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.stages.prairie = new Isomaton.Stage("prairie", {
		start: function start() {
			var world = this.world;
			var worldOptions = world.options();
			//console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var waterBlock = world.blockTypes["materials.water"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];
			var yellowflowersBlock = world.blockTypes["decorations.yellowflowers"];
			var shortweedsBlock = world.blockTypes["decorations.shortweeds"];
			var groundArea = new Area(new Coord(1, 1, -2), worldOptions.width, worldOptions.height);

			var whiteFrameBlock = world.blockTypes["cursors.whiteplaceholder"];
			var frameArea = new Area(new Coord(1, -3, 6), worldOptions.width, 1);
			this.placeBlocks(builder.fill(whiteFrameBlock, frameArea));

			this.editMode(editModes.emptyFirst);

			// place layer of stone
			this.placeBlocks(builder.fill(stoneBlock, groundArea));

			// place layer of dirt
			groundArea.coord.up();
			this.placeBlocks(builder.fill(dirtBlock, groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.placeBlocks(builder.fill(grassBlock, groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(this.random("dirtPatchCount") * 9);
			this.placeBlocks(isomaton.builder.random(this.random("dirtPatches"), dirtBlock, groundArea, dirtPatchCount));

			// place random patches of water in the grass at random
			var waterCount = Math.round(this.random("waterCount") * 9);
			this.placeBlocks(isomaton.builder.random4(this.random("water"), waterBlock, groundArea, waterCount));

			// Go up once to place stuff "on" the ground layer
			groundArea.coord.up();

			// place random yellow flowers
			var flowersCount = Math.round(this.random("flowersCount") * 9 + 3);
			this.placeBlocks(isomaton.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));

			// place random weeds
			var weedCount = Math.round(this.random("weedCount") * 20 + 3);
			this.placeBlocks(isomaton.builder.random(this.random("weeds"), shortweedsBlock, groundArea, weedCount));

			// place a gold block at random
			var randomCoord = groundArea.randomCoord(this.random("goldBlock"));
			this.placeBlocks(isomaton.builder.one(goldBlock, randomCoord), true);

			// place 5 stones at random
			this.placeBlocks(isomaton.builder.random(this.random("stones"), stoneBlock, groundArea, 5));

			// place 1 slime
			var slime = new world.Actors.Slime(groundArea.randomCoord(this.random("slimeCoord")));
			this.placeActors([slime]);

			// place 2 chickens
			var chicken1 = new world.Actors.Chicken(groundArea.randomCoord(this.random("chickenCoord1")));
			var chicken2 = new world.Actors.Chicken(groundArea.randomCoord(this.random("chickenCoord2")));
			this.placeActors([chicken1, chicken2]);

			// place 1 knight
			var knight = new world.Actors.Knight(groundArea.randomCoord(this.random("knightCoord")));
			this.placeActors([knight]);

			// place 1 sidekick
			var sidekick = new world.Actors.Sidekick(groundArea.randomCoord(this.random("sidekickCoord")));
			this.placeActors([sidekick]);

			// place 1 princess
			var princess = new world.Actors.Princess(groundArea.randomCoord(this.random("princessCoord")));
			this.placeActors([princess]);

			// place frame
			this.placeBlocks(isomaton.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));


		},
		step: function prairieStep() {
		}
	});




})(window.isomaton, window.Isomaton);