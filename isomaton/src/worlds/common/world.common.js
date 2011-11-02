
// todo: move all actors into global scope in a separate package

(function (isomaton, I) {

	var world;

	// todo: worl instantiation makes no sense
	world = isomaton.worlds.common = new isomaton.World(window.commonworld);

	world.Actors.Cursor = function Cursor(options) {
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "cursor";
		this.label = "Cursor";
		// todo: use a functionnal getter for block types (with fallbacks)
		this.blockType = world.blockTypes["cursors.whiteframe"];
		this.subscribe("bind", function () {
			// When an actor teleports to this spawn point
			this.react("activate", function (source, options) {
				// Find any Actor following the cursor
				var followers = this.stage.state.find({
					"class": "Actor",
					"followCursor": true
				});
				if (followers.first()) {
					// Compell the follower to grab or act on the item under the cursor
					// if he is in direct reach (ext to the cursor)
					console.log("YATA!");
				} else {
					// Otherwise, bind the first knight found
					var knight = this.stage.state.find({
						"class": "Actor",
						"type": "knight"
					}).first();
					if (knight) {
						// If the knight is found, set him up to follow the cursor
						knight.set({followCursor: true});
					}
					console.log("Calling the knight");
				}
			});
			this.react("release", function (source, options) {
				// Find any Actor following the cursor
				var followers = this.stage.state.find({
					"class": "Actor",
					"followCursor": true
				});
				if (followers.first()) {
					// If followers are found, unbind them from their obligation
					followers.set({
						followCursor: false
					});
				}
			});
		});
		this.init();
	};

	world.Actors.SpawnPoint = function SpawnPoint(options) {
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "spawnPoint";
		this.label = "Spawn point";
		// todo: use a functionnal getter for block types (with fallbacks)
		this.blockType = world.blockTypes["blank.empty"];
		this.subscribe("bind", function () {
			// When an actor teleports to this spawn point
			this.react("respawnTo", function (source, options) {
				var stage = source.stage;
				source.goNext(this.coord.copy());
				stage.sounds.play("pop");
			});
		});
		this.init();
	};

	world.Actors.Slime = function Slime(options) {
		// todo: better handling of default options and default values when inheriting
		this.defaultLife = 3;

		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "slime";
		this.label = "Slime";
		this.blockType = world.blockTypes["actors.slime"];
		this.compulsions.WanderAtRandom = new I.Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 6
		});
		this.compulsions.Escape = new I.Compulsions.Escape(this, {
			weight: [5, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
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
		this.compulsions.Follow = new I.Compulsions.Follow(this, {
			weight: [3, 0.9],
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
		this.compulsions.Attack = new I.Compulsions.Attack(this, {
			weight: [4, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			minDistance: 0,
			maxDistance: 3,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "chicken") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});

		// todo: generalize this behavior as life/living mixin
		this.subscribe("bind", function () {
			// todo: get re-Hit protection limit from setting
			var hitProtectionLength = 10;
			this.react("hit", function (source, options) {
				if (!this.lastHit) {
					// Initialize a lastHit marker to calculate the hitProtection scheme
					this.lastHit = this.stage.time - (hitProtectionLength + 1);
				}
				if (this.stage.time - this.lastHit > hitProtectionLength) {
					// Play the "hit" sound effect
					// Decrease life by 1
					// todo: strength of hit should be flexible
					this.life = this.life - 1;
					// Keep a lastHit marker to calculate the hitProtection scheme
					this.lastHit = this.stage.time;
					this.updateStatus();
					// Actor doesnt have any life left, he dies
					if (this.life <= 0) {
						this.act("die", this);
						// todo: actor shouldn gain back life here
						this.life = this.defaultLife;

					}
				}
			});
		});

		this.init();
	};

	world.Actors.TinySlime = function TinySlime(options) {
		// todo: better handling of default options and default values when inheriting
		this.defaultLife = 1;
		world.Actors.Slime.apply(this, arguments); // Inherit from the Actor class
		this.type = "tinySlime";
		this.label = "Tiny Slime";
		this.blockType = world.blockTypes["actors.tinySlime"];
		this.init();
	};

	world.Actors.Chicken = function Chicken(options) {
		this.defaultLife = 2;
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "chicken";
		this.label = "Chicken";
		this.blockType = world.blockTypes["actors.chicken"];
		// Chicken will wander around randomly if nothing else to do
		this.compulsions.WanderAtRandom = new I.Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 6
		});
		// Chicken will start to follow fast any chicken that is within a distance between 4 and 20 blocks
		this.compulsions.Follow = new I.Compulsions.Follow(this, {
			weight: [2, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 4,
			minDistance: 5,
			maxDistance: 30,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "chicken") {
					weight = this.weightByDistance(distance);
				}
				return weight;
			}
		});


		// Chicken will escape fast if any actor that is not chicken moves within 4 blocks
		this.compulsions.Escape = new I.Compulsions.Escape(this, {
			weight: [3, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
			stepInterval: 2,
			minDistance: 1,
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
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "knight";
		this.label = "Knight";
		this.blockType = world.blockTypes["actors.knight"];
		this.compulsions.WanderAtRandom = new I.Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 4
		});
		this.compulsions.Follow = new I.Compulsions.Follow(this, {
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
		this.compulsions.Attack = new I.Compulsions.Attack(this, {
			weight: [3, 0.9], // Will override WanderAtRandom if the weight is resolved at more than 0.1
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
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "sidekick";
		this.label = "Sidekick";
		this.blockType = world.blockTypes["actors.sidekick"];
		this.compulsions.WanderAtRandom = new I.Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 5
		});
		this.compulsions.Follow = new I.Compulsions.Follow(this, {
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
		I.Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "princess";
		this.label = "Princess";
		this.blockType = world.blockTypes["actors.princess"];
		this.compulsions.WanderAtRandom = new I.Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 8
		});
		// The princess will follow the chicken slowly from a distance of 5 blocks
		this.compulsions.Follow = new I.Compulsions.Follow(this, {
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
		this.compulsions.Escape = new I.Compulsions.Escape(this, {
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

	world.stages.prairie = new I.Stage("prairie", {
		start: function start() {
			var coord;
			var world = this.world;

			var worldOptions = world.options();
			console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var waterBlock = world.blockTypes["materials.water"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];
			var yellowflowersBlock = world.blockTypes["decorations.yellowflowers"];
			var shortweedsBlock = world.blockTypes["decorations.shortweeds"];
			var groundArea = new I.Area(new I.Coord(1, 1, -2), worldOptions.width, worldOptions.height);
/*
			var whiteFrameBlock = world.blockTypes["cursors.whiteplaceholder"];
			var frameArea = new I.Area(new I.Coord(1, -3, 6), worldOptions.width, 1);
			this.placeBlocks(I.builder.fill(whiteFrameBlock, frameArea));
*/

			this.editMode(I.editModes.emptyFirst);

			// place layer of stone
			// todo: bring back this layer once isograph is optimized
//			this.placeBlocks(I.builder.fill(stoneBlock, groundArea));

			// place layer of dirt
			groundArea.coord.up();
			// todo: bring back this layer once isograph is optimized
//			this.placeBlocks(I.builder.fill(dirtBlock, groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.placeBlocks(I.builder.fill(grassBlock, groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(this.random("dirtPatchCount") * 9);
			this.placeBlocks(I.builder.random(this.random("dirtPatches"), dirtBlock, groundArea, dirtPatchCount));

			// place random patches of water in the grass at random
			var waterCount = Math.round(this.random("waterCount") * 9);
			this.placeBlocks(I.builder.random4(this.random("water"), waterBlock, groundArea, waterCount));

			// Go up once to place stuff "on" the ground layer
			groundArea.coord.up();

			// place random yellow flowers
			var flowersCount = 8;//Math.round(this.random("flowersCount") * 9 + 3);
			this.placeBlocks(I.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));

			// place random weeds
			var weedCount = 24;//Math.round(this.random("weedCount") * 20 + 3);
			this.placeBlocks(I.builder.random(this.random("weeds"), shortweedsBlock, groundArea, weedCount));

			// place a gold block at random
			var randomCoord = groundArea.randomCoord(this.random("goldBlock"));
			this.placeBlocks(I.builder.one(goldBlock, randomCoord));

			// place 5 stones at random
			this.placeBlocks(I.builder.random(this.random("stones"), stoneBlock, groundArea, 5));

			// place 1 slime
			coord = groundArea.randomCoord(this.random("slimeCoord"));
			var slime = new world.Actors.Slime().bind(this, coord);
//			this.placeActors([slime]);

			// place the cursor at the center of the stage
			var cursor = new world.Actors.Cursor().bind(this, new Isomaton.Coord(10, 10, 1, 0));
				this.placeActors([cursor]);

			// place 2 tiny slime
			var tinySlime;
			coord = groundArea.randomCoord(this.random("tinySlimeCoord"));
			tinySlime = new world.Actors.TinySlime().bind(this, coord);
//			this.placeActors([tinySlime]);

			coord = groundArea.randomCoord(this.random("tinySlimeCoord2"));
			tinySlime = new world.Actors.TinySlime().bind(this, coord);
//			this.placeActors([tinySlime]);

			// place 4 chickens
			coord = groundArea.randomCoord(this.random("chickenCoord1"));
			var chicken1 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord2"));
			var chicken2 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord3"));
			var chicken3 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord4"));
			var chicken4 = new world.Actors.Chicken().bind(this, coord);
//			this.placeActors([chicken1, chicken2, chicken3, chicken4]);

			// place 1 knight
			coord = groundArea.randomCoord(this.random("knightCoord"));
			var knight = new world.Actors.Knight().bind(this, coord);
			this.placeActors([knight]);

			// place 1 sidekick
			coord = groundArea.randomCoord(this.random("sidekickCoord"));
			var sidekick = new world.Actors.Sidekick().bind(this, coord);
//			this.placeActors([sidekick]);

			// place 1 princess
			coord = groundArea.randomCoord(this.random("princessCoord"));
			var princess = new world.Actors.Princess().bind(this, coord);
//			this.placeActors([princess]);

			// place 12 spawn points
			var i, spawnPoints = [];
			for (i = 0; i < 20; i = i + 1) {
				coord = groundArea.randomCoord(this.random("spawnCoords-" + i));
				spawnPoints.push(new world.Actors.SpawnPoint().bind(this, coord));
			}
//			this.placeActors(spawnPoints);

			// place frame
//			this.placeBlocks(I.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));


		},
		step: function prairieStep() {
		}
	});




})(window.isomaton, window.Isomaton);
