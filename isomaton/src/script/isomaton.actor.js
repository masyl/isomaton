/*global Isomaton, _, PubSub, Bobify */
//todo: adopt or dump the _doc approach
function doc(pseudo) {
}
(function (global, Isomaton, _, PubSub, Bobify) {
	"use strict";

	/**
	 * Actor Class
	 * @param [options]
	 */
	Isomaton.Actor = function Actor(options) {
		// Can the Bobify and PubSub mixins load with a common mechanism ?

		PubSub.call(this); // Add publisher/subscriber functionnalities

		// Add basic bob functionnalities to this object
		Bobify(this, {
			index: function index() {
				var attrs = {
					"class": this["class"],
					"uid": this["class"] + "-" + this.id,
					"id": this.id,
					"type": this.type,
					"followCursor": this.followCursor,
					"coord.x": this.coord.x,
					"coord.y": this.coord.y,
					"coord.z": this.coord.z
				};
				if (this.nextCoord) {
					attrs["nextCoord.x"] = this.nextCoord.x;
					attrs["nextCoord.y"] = this.nextCoord.y;
					attrs["nextCoord.z"] = this.nextCoord.z;
				}
				return attrs;
			}
		});

		var actor = this; // Self reference

		// Extend options
		this.options = this.options || {};
		_(this.options).extend(options);

		this.set({
			id: null, // a unique id for this actor (initialised on init)
			"class": "Actor", // A object class id
			coord: null, // The current position of the actor
			nextCoord: null, // The future position of the actor
			prevCoord: null, // The previous position of the actor
			label: "Blank", // The label for this actor
			stage: null, // Reference to the parent stage
			compulsions: {}, // Collection of compulsion that animate the actors behaviors
			blockType: null, // A string id of the blockType
			block: null, // The block representing the Actor
			followCursor: false,
			// The life meter of this actor
			defaultLife: this.defaultLife || this.options.defaultLife || 10,
			life: this.life || this.defaultLife
		});

		/**
		 * Basic compulsion for tracking the cursor if compelled
		 */
		this.compulsions.TrackCursor = new Isomaton.Compulsions.Track(this, {
			weight: [100, 0.9],
			stepInterval: 2,
			minDistance: 1,
			maxDistance: 24,
			resolveTarget: function resolveTarget(actor, distance) {
				var weight = 0;
				if (actor.type === "cursor") {
					weight = 100;//this.weightByDistance(distance);
				}
				return weight;
			}
		});


		/**
		 * Initialize and Bind the actor to its parent stage
		 * @param stage
		 * @param coord
		 */
		this.bind = function bind(stage, coord) {
			// Which stage to bind to
			this.stage = stage;

			this.set({
				// Get a unique Id for this stage
				id: this.id || String(stage.uid()), // Unique Id must be a string
				// Place where on stage
				coord: coord,
				// Create the block to represent the actor
				block: new Isomaton.Block(this.blockType, coord)
			});

			// Bind the block to its parent actor
			this.block.set({
				actor: this
			});
			// Trigger the bind event
			this.publish("bind");
			return this;
		};

		// Basic move	ment rules
		// todo: should be a mixxin
		this.movementRules = [
			Isomaton.Rules.CantWalkOnEmptyOrNonSolid,
			Isomaton.Rules.CantWalkIntoSolids
		];

		/**
		 * Set a coordinate as the location of the actor in the next step
		 * @param coord
		 */
		this.goNext = function goNext(coord) {
			this.set({
				nextCoord: coord
			});
			this.block.goNext(coord);
			if (this.blockInHands) {
				this.blockInHands.goNext(coord.copy().up());
			}
			return this;
		};

		/**
		 * Set a coordinate as the location of the actor in the next step
		 * @param coord
		 */
		this.undoGoNext = function undoGoNext() {
			this.set({
				nextCoord: null
			});
			this.block.goNext(null);
			if (this.blockInHands) {
				this.blockInHands.goNext(null);
			}
			return this;
		};

		/**
		 * Process the nextCoord as a valide move for the actor and its block
		 * and update the miniDB index
		 */
		this.go = function go() {
			// todo: manage a better coord history queue
			if (this.nextCoord) {
				this.set({
					prevCoord: this.coord,
					coord: this.nextCoord,
					nextCoord: null
				});
			}
			this.block.go();
			if (this.blockInHands) {
				this.blockInHands.go();
			}
			return this;
		};

		/**
		 * Validate the current planned move (with goNext). If it fails validation rollback the value.
		 */
		this.validateMove = function () {
			var i, rule, isValid;
			isValid = true;
			if (this.nextCoord) {
				for (i = 0; i < this.movementRules.length; i = i + 1) {
					isValid = this.movementRules[i].call(this);
					if (!isValid) {
						break;
					}
				}
				if (!isValid) {
					this.undoGoNext();
				}
			}
			return this;
		};

		/**
		 * The default method called every time the stage goes through a step
		 */
		this.step = function step() {
			var compulsion = this.resolveCompulsions();
			if (compulsion) {
				compulsion.act();
			}
			this.validateMove();
			return this;
		};

		/**
		 * Select the dominant compulsion that will be given control over the actor for a single step
		 */
		this.resolveCompulsions = function () {
			var i, compulsion, weight, resolvedCompulsion, resolvedCompulsionWeight;
			weight = 0;
			resolvedCompulsionWeight = 0;
			for (i in this.compulsions) {
				if (this.compulsions.hasOwnProperty(i)) {
					compulsion = this.compulsions[i];
					weight = compulsion.resolve();
					if (weight > resolvedCompulsionWeight) {
						resolvedCompulsion = compulsion;
						resolvedCompulsionWeight = weight;
					}
				}
			}
			return resolvedCompulsion;
		};

		/**
		 * Empty placeholder function
		 */
		this.init = function init() {
			return this;
		};

        /**
         * Trigger an action, possibly on a subject
         * @param {String} action
         * @param {Object} [subject]
         * @param {Object} [options]
         */
		this.act = function act(action, subject, options) {
			this.stage.act(action, this, subject, options);
			return this;
		};

		/**
		 * Register a hanler to be triggered when an action occur
		 * @param action
		 * @param handler
		 */
		this.react = function react(action, handler) {
			this.stage.react(action, this, handler);
			return this;
		};

		// todo: check if this is redundant
		this.updateStatus = function updateStatus() {
			this.stage.updateActorStatus(this);
		};

		/**
		 * Called when the mouse leaves an actors' block
		 */
		this.blur = function blur() {
		};

		/**
		 * Called when the mouse moves over an actors' block
		 */
		this.focus = function focus() {
		};

		/**
		 * Called when an actor has been clicked on
		 */
		this.select = function select() {
			this.stage.actorSelect(this);
		};

		this.blockInHands = null;

		this.use = function use(coord) {
			var blocks, block, newCoord, newCoordZ, canStack;
			// Find blocks on this coordinate
			blocks = this.stage.state.find({
				"class": "Block",
				"type.isOffstage": false,
				"coord.x": coord.x,
				"coord.y": coord.y
			});
			// Filter out blocks not in the playing fields

			blocks = blocks.filter(function(index, item) {
				return item.coord.z < 3;
			});

			// Order them by which is top most
			blocks.sort(function(a, b) {
				return a.coord.z < b.coord.z;
			});

			if (blocks.length) {
				block = blocks[0];
			}

			// If actor is carrying a block
			canStack = true;
			if (this.blockInHands) {
				// Test if there is a place to put the block within the playing fields
				if (block) {
					newCoordZ = block.coord.z + 1;
					if (!block.type.isStackable) {
						canStack = false;
					}
				} else {
					newCoordZ = 0;
				}
				if (canStack) {
					if (newCoordZ < 3 && canStack) {
						newCoord = coord.copy();
						newCoord.z = newCoordZ;
						this.blockInHands.goNext(newCoord).go(newCoord);
						this.blockInHands = null;
					} else {
						// Else emit a rejection sound
						console.log("CANT DROP THIS BLOCK HERE! No free space");
					}
				} else {
					// Else emit a rejection sound
					console.log("CANT STACK A BLOCK ON THIS BLOCK");
				}
			} else {
				if (block) {
					// Else if actor isnt carrying anything
					// If it is a pickable block
					if (block.type.isPickable) {
						// Place the block in the actors hands (one block up)
						this.set({
							blockInHands: block
						});
						newCoord = this.coord.copy().up();
						block.goNext(newCoord).go();
					} else {
						// Else emit a rejection sound
						console.log("CANT PICKUP THIS BLOCK!");
					}
				} else {
					// Else emit a rejection sound
					console.log("NO BLOCKS TO PICKUP!");
				}
			}
		};

		this.subscribe("bind", function () {
			// todo: move the "die" reaction to a "living" mixxing
			this.react("die", function (source, options) {
				this.act("respawn", source, options);
			});

			this.react("respawn", function (source, options) {
				var spawners, spawner;
				doc("Get the list of available spawners");
				spawners = this.stage.state.find({
					"class": "Actor",
					type: "spawnPoint"
				});
				doc("Pick a spawnPoint at random");
				spawner = this.stage.randomItem("randomSpawn-" + this.id, spawners);
				doc("Teleport to the selected spawnPoint");
				if (spawner) {
					this.act("respawnTo", spawner);
				}
			});
			// todo: find a better method/signature to handle situation when the game want to order an actor to do something
			this.react("forceUse", function (source, options) {
				this.use(options.coord);
			});
		});
	};

}(this, Isomaton, _, PubSub, Bobify));

