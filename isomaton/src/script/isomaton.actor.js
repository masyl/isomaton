(function IsomatonActorPackage(Isomaton, $, _, undefined) {

	var Rules;

	Rules = Isomaton.Rules;

	Isomaton.Actor = function Actor(options) {
		this.id = null;
		this._options = {};
		this.coord = null;
		this.nextCoord = null;
		this.block = null;
		this.label = "Blank";
		this.stage = null;
		this.compulsions = {};
		this.blockType = null;

		this.bind = function bind(stage, coord) {
			// Which stage to bind to
			this.stage = stage;
			// Get a unique Id for this stage
			this.id = this.id || stage.uid() + ""; // Unique Id must be a string
			// Place where on stage
			this.coord = coord;
			// Create the block to represent the actor
			this.block = new isomaton.Block(this.blockType, coord);
			return this;
		};

		this.movementRules = [
			Rules.CantWalkOnEmptyOrNonSolid,
			Rules.CantWalkIntoSolids
		];

		this.validateMove = function () {
			var i, rule, isValid;
			isValid = true;
			if (this.nextCoord) {
				for (i = 0; i < this.movementRules.length; i = i + 1) {
					isValid = this.movementRules[i].call(this);
					if (!isValid) break;
				}
				if (!isValid) {
					this.nextCoord = null;
				}
			}
			return this;
		};

		this.step = function step() {
			var compulsion = this.resolveCompulsions();
			if (compulsion) {
				compulsion.act();
			}
			return this;
		};

		this.resolveCompulsions = function () {
			var i, compulsion, weight, resolvedCompulsion, resolvedCompulsionWeight;
			weight = 0;
			resolvedCompulsionWeight = 0;
			for (i in this.compulsions) {
				compulsion = this.compulsions[i];
				weight = compulsion.resolve();
				if (weight > resolvedCompulsionWeight) {
					resolvedCompulsion = compulsion;
					resolvedCompulsionWeight = weight;
				}
			}
			return resolvedCompulsion;
		};

		this.init = function init() {
			return this;
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
	}

})(Isomaton, jQuery, _);
