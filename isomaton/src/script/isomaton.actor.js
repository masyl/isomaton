/*global Isomaton, _, PubSub */
function doc(pseudo) {
}
(function (global, Isomaton, _, PubSub) {
	"use strict";

	var
		// Global imports
		Rules = Isomaton.Rules;

	/**
	 * Actor Class
	 * @param [options]
	 */
	Isomaton.Actor = function Actor(options) {
		PubSub.call(this); // Add publisher/subscriber functionnalities

		var actor = this; // Self reference

		// Extend options
		this.options = this.options || {};
		_(this.options).extend(options);

		this.id = null; // a unique id for this actor (initialised on init)
		this.coord = null; // The current position of the actor
		this.nextCoord = null; // The future position of the actor
		this.prevCoord = null; // The previous position of the actor
		this.block = null; // The default block representing the actor
		this.label = "Blank"; // The label for this actor
		this.stage = null; // Reference to the parent stage
		this.compulsions = {}; // Collection of compulsion that animate the actors behaviors
		this.blockType = null; // A string id of the blockType
		this.block = null; // The block representing the Actor

		// The life meter of this actor
		this.defaultLife = this.defaultLife || this.options.defaultLife || 10;
		this.life = this.life || this.defaultLife;


		/**
		 * Initialize and Bind the actor to its parent stage
		 * @param stage
		 * @param coord
		 */
		this.bind = function bind(stage, coord) {
			// Which stage to bind to
			this.stage = stage;
			// Get a unique Id for this stage
			this.id = this.id || String(stage.uid()); // Unique Id must be a string
			// Place where on stage
			this.coord = coord;
			// Create the block to represent the actor
			this.block = new Isomaton.Block(this.blockType, coord);
			this.block.actor = this;
			this.publish("bind");
			return this;
		};

		// Basic move	ment rules
		// todo: should be a mixxin
		this.movementRules = [
			Rules.CantWalkOnEmptyOrNonSolid,
			Rules.CantWalkIntoSolids
		];

		/**
		 * Set a coordinate as the location of the actor in the next step
		 * @param coord
		 */
		this.goNext = function goNext(coord) {
			this.nextCoord = coord;
			this.block.goNext(coord);
			this.updateIndex();
		};

		/**
		 * Update the actor and block index in their MiniDB object stores
		 */
		this.updateIndex = function updateIndex() {
			this.stage.actors.update(this);
			// todo: refactor, the actor should not be responsible to update the blocks indexes
			this.stage.blocks.update(this.block);
		};

		/**
		 * Process the nextCoord as a valide move for the actor and its block
		 * and update the miniDB index
		 */
		this.go = function go() {
			// todo: manage a better coord history queue
			if (this.nextCoord) {
				this.prevCoord = this.coord;
				this.coord = this.nextCoord;
				this.nextCoord = null;
			}
			this.block.go();
			this.updateIndex();
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
						if (this.type === "slime")
	//					console.log("move rollback", this, this.movementRules[i]);
						break;
					}
				}
				if (!isValid) {
					// Invalidate the nextCoordinate of both the actor and its block
					this.nextCoord = null;
					this.block.nextCoord = null;
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
		 * Return a unique string id for this object
		 */
		this.toString = function toString() {
			return "Actor-" + this.id;
		};

		/**
		 * Return the index keys for a miniDB store
		 */
		this.toIndex = function txoIndex() {
			var index;
			index = {
				"id": this.id,
				"class": "Actor",
				"type": this.type,
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

		this.subscribe("bind", function () {
			// todo: move the "die" reaction to a "living" mixxing
			this.react("die", function (source, options) {
				this.act("respawn", source, options);
			});

			this.react("respawn", function (source, options) {
				var spawners, spawner;
				doc("Get the list of available spawners");
				spawners = this.stage.actors.select({type: "spawnPoint"}).get();
				doc("Pick a spawnPoint at random");
				spawner = this.stage.randomItem("randomSpawn-" + this.id, spawners);
				doc("Teleport to the selected spawnPoint");
				if (spawner) {
					this.act("respawnTo", spawner);
				}
			});
		});
	};

}(this, Isomaton, _, PubSub));

