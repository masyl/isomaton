/*global Isomaton, _, PubSub, Bobify */
(function (global, Isomaton, _, PubSub, Bobify) {
	"use strict";

	var Actor, Actors, Compulsions, Blocks;
	Blocks = Isomaton.Blocks;
	Actor = Isomaton.Actor;
	Compulsions = Isomaton.Compulsions;
	Actors = Isomaton.Actors = {};

	Actors.Cursor = function Cursor(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "cursor";
		this.label = "Cursor";
		// todo: use a functionnal getter for block types (with fallbacks)
		this.blockType = Blocks["cursors.whiteframe"];
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

	Actors.SpawnPoint = function SpawnPoint(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "spawnPoint";
		this.label = "Spawn point";
		// todo: use a functionnal getter for block types (with fallbacks)
		this.blockType = Blocks["blank.empty"];
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

	Actors.Slime = function Slime(options) {
		// todo: better handling of default options and default values when inheriting
		this.defaultLife = 3;

		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "slime";
		this.label = "Slime";
		this.blockType = Blocks["actors.slime"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 6
		});
		this.compulsions.Escape = new Compulsions.Escape(this, {
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
		this.compulsions.Follow = new Compulsions.Follow(this, {
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
		this.compulsions.Attack = new Compulsions.Attack(this, {
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

	Actors.TinySlime = function TinySlime(options) {
		// todo: better handling of default options and default values when inheriting
		this.defaultLife = 1;
		Actors.Slime.apply(this, arguments); // Inherit from the Actor class
		this.type = "tinySlime";
		this.label = "Tiny Slime";
		this.blockType = Blocks["actors.tinySlime"];
		this.init();
	};

	Actors.Chicken = function Chicken(options) {
		this.defaultLife = 2;
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "chicken";
		this.label = "Chicken";
		this.blockType = Blocks["actors.chicken"];
		// Chicken will wander around randomly if nothing else to do
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			weight: [1, 0],
			stepInterval: 6
		});
		// Chicken will start to follow fast any chicken that is within a distance between 4 and 20 blocks
		this.compulsions.Follow = new Compulsions.Follow(this, {
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
		this.compulsions.Escape = new Compulsions.Escape(this, {
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


	Actors.Knight = function Knight(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "knight";
		this.label = "Knight";
		this.blockType = Blocks["actors.knight"];
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

	Actors.Sidekick = function Sidekick(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "sidekick";
		this.label = "Sidekick";
		this.blockType = Blocks["actors.sidekick"];
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

	Actors.Princess = function Princess(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "princess";
		this.label = "Princess";
		this.blockType = Blocks["actors.princess"];
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


}(this, Isomaton, _, PubSub, Bobify));

