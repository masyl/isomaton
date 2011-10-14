(function (isomaton, Isomaton){

	var world = isomaton.worlds.common = new isomaton.World(window.commonworld);

	var Coord = Isomaton.Coord;
	var Compulsions = Isomaton.Compulsions;
	var Actor = Isomaton.Actor;
	var Area = isomaton.Area;
	var Rules = Isomaton.Rules;
	var builder = isomaton.builder;
	var editModes = Isomaton.editModes; // Constants


	world.Actors.Spawner = function Spawner(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "spawner";
		this.label = "Spawner";
		this.blockType = world.blockTypes["blank.empty"];
		this.subscribe("bind", function () {
			// When an actor teleports to this spawn point
			this.react("respawnTo", function (source, options) {
				source.nextCoord = this.coord.copy();

			});
		});
		this.init();
	};

	world.Actors.Slime = function Slime(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "slime";
		this.label = "Slime";
		this.blockType = world.blockTypes["actors.slime"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 6
		});
		this.compulsions.Escape = new Compulsions.Escape(this, {
			weight: [2, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 3,
			minDistance: 0,
			maxDistance: 6,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				// Escape the knight
				if (actor.type === "knight") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		// Slime will start to follow  any princess that is within a distance between 1 and 16 blocks
		this.compulsions.Follow = new Compulsions.Follow(this, {
			weight: [1, 0.9],
			stepInterval: 4,
			minDistance: 1,
			maxDistance: 16,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "princess") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.subscribe("bind", function () {
			this.react("hit", function (source, options) {
				this.act("respawn", this); // Slime teleports itself somewhere else

			});
		});
		this.init();
	};


	world.Actors.Chicken = function Chicken(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "chicken";
		this.label = "Chicken";
		this.blockType = world.blockTypes["actors.chicken"];
		// Chicken will wander around randomly if nothing else to do
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 5
		});
		// Chicken will start to follow fast any chicken that is within a distance between 4 and 20 blocks
		this.compulsions.Follow = new Compulsions.Follow(this, {
			weight: [2, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			minDistance: 5,
			maxDistance: 20,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "chicken") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		// Chicken will escape fast if any actor that is not chicken moves within 4 blocks
		this.compulsions.Escape = new Compulsions.Escape(this, {
			weight: [3, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			maxDistance: 5,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				// Escape the knight
				if (actor.type !== "chicken") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.init();
	};


	world.Actors.Knight = function Knight(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "knight";
		this.label = "Knight";
		this.blockType = world.blockTypes["actors.knight"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 4
		});
		this.compulsions.Follow = new Compulsions.Follow(this, {
			weight: [1, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			minDistance: 1,
			maxDistance: 16,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "slime") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.compulsions.Attack = new Compulsions.Attack(this, {
			weight: [2, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			minDistance: 0,
			maxDistance: 2,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "slime") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.init();
	};

	world.Actors.Sidekick = function Sidekick(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "sidekick";
		this.label = "Sidekick";
		this.blockType = world.blockTypes["actors.sidekick"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 5
		});
		this.compulsions.Follow = new Compulsions.Follow(this, {
			weight: [1, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 4,
			minDistance: 3,
			maxDistance: 16,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "knight") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.init();
	};

	world.Actors.Princess = function Princess(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "princess";
		this.label = "Princess";
		this.blockType = world.blockTypes["actors.princess"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 8
		});
		// The princess will follow the chicken slowly from a distance of 5 blocks
		this.compulsions.Follow = new Compulsions.Follow(this, {
			weight: [2, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 6,
			minDistance: 6,
			maxDistance: 20,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "chicken") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		// Chicken will escape fast if any actor that is not chicken moves within 4 blocks
		this.compulsions.Escape = new Compulsions.Escape(this, {
			weight: [3, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 3,
			maxDistance: 6,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				// Escape the knight
				if (actor.type !== "slime") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});
		this.init();
	};

	world.stages.prairie = new Isomaton.Stage("prairie", {
		start: function start() {
			var coord;
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
/*
			var whiteFrameBlock = world.blockTypes["cursors.whiteplaceholder"];
			var frameArea = new Area(new Coord(1, -3, 6), worldOptions.width, 1);
			this.placeBlocks(builder.fill(whiteFrameBlock, frameArea));
*/

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
			coord = groundArea.randomCoord(this.random("slimeCoord"));
			var slime = new world.Actors.Slime().bind(this, coord);
			this.placeActors([slime]);

			// place 4 chickens
			coord = groundArea.randomCoord(this.random("chickenCoord1"));
			var chicken1 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord2"));
			var chicken2 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord3"));
			var chicken3 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord4"));
			var chicken4 = new world.Actors.Chicken().bind(this, coord);
			this.placeActors([chicken1, chicken2, chicken3, chicken4]);

			// place 1 knight
			coord = groundArea.randomCoord(this.random("knightCoord"));
			var knight = new world.Actors.Knight().bind(this, coord);
			this.placeActors([knight]);

			// place 1 sidekick
			coord = groundArea.randomCoord(this.random("sidekickCoord"));
			var sidekick = new world.Actors.Sidekick().bind(this, coord);
			this.placeActors([sidekick]);

			// place 1 princess
			coord = groundArea.randomCoord(this.random("princessCoord"));
			var princess = new world.Actors.Princess().bind(this, coord);
			this.placeActors([princess]);

			// place 12 spawn points
			var i, spawners = [];
			for (i = 0; i < 20; i = i + 1) {
				coord = groundArea.randomCoord(this.random("spawnCoords-" + i));
				spawners.push(new world.Actors.Spawner().bind(this, coord));
			}
			console.log("spawners added: ", spawners);
			this.placeActors(spawners);

			// place frame
			this.placeBlocks(isomaton.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));


		},
		step: function prairieStep() {
		}
	});




})(window.isomaton, window.Isomaton);
