(function IsomatonCompulsionsPackage(Isomaton, $, _, undefined) {

	var Compulsions;
	Compulsions = Isomaton.Compulsions = {};

	function Compulsion(actor, _options) {
		this.options = _options || {};
		// Weight factors take the form of a two item array, the first is the multiply factor and the second
		// is the addition factor
		var weightFactors = this.weightFactors = this.options.weight || [1,0];

		this.actor = actor;
		this.stepInterval = (this.options.stepInterval !== undefined) ? this.options.stepInterval : 1;
		this.minDistance = (this.options.stepInterval !== undefined) ? this.options.minDistance : 1;
		this.maxDistance = (this.options.stepInterval !== undefined) ? this.options.maxDistance : 10;

		this.weight = function () {
			return 1;
		};
		this.resolve = function () {
			var total;
			total = (this.weight() * weightFactors[0]) + weightFactors[1];
			return total;
		};
		this.weightByDistance = function weightByDistance(distance) {
			var weight;
			weight = 0;
			// If the distance is within the specified min/max limits
			if (distance < this.maxDistance && distance > this.minDistance) {
				// Give a 0 to 1 relative weight depending on how short the distance is
				weight = 1 - ((distance - this.minDistance) / (this.maxDistance - this.minDistance));
			}
			return weight;
		}
	}

	function relativeWeightByMinMaxDistance () {
		var i, targets, target, targetWeight, bestTarget, bestTargetWeight, distance;
		targets = this.actor.stage.state.find({"class":"Actor"});
		targetWeight = 0;
		bestTargetWeight = 0;
		// Find a prey to follow
		for (i = 0; i < targets.length; i = i + 1) {
			target = targets[i];
			distance = this.actor.coord.stepDistanceFrom(target.coord);
			targetWeight = this.resolveTarget(target, distance);
			if (targetWeight > bestTargetWeight) {
				bestTarget = target;
				bestTargetWeight = targetWeight;
			}
		}
		this.target = bestTarget;
		return bestTargetWeight;
	}

	Compulsions.WanderAtRandom = function WanderAtRandom(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options;

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				// Move at random
				var direction = actor.stage.randomItem(actor.id, [0, 1, 2, 3]);
				actor.block.coord.direction = direction;
				actor.goNext(actor.coord.copy().move(direction));
			}
		};
	};

	Compulsions.Follow = function Follow(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options, minDistance, maxDistance;

		this.resolveTarget = this.options.resolveTarget;
		this.target = null;

		this.weight = relativeWeightByMinMaxDistance;

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				var directions = actor.coord.directionsNotAway(this.target.coord);
				actor.block.coord.direction = actor.stage.randomItem(actor.id, directions);
				actor.goNext(actor.coord.copy().move(actor.block.coord.direction));
			}
			if (this.options.act) {
				this.options.act.call(this);
			}
		};
	};

	Compulsions.Track = function Track(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options, minDistance, maxDistance;

		this.resolveTarget = this.options.resolveTarget;
		this.target = null;

		this.weight = relativeWeightByMinMaxDistance;

		this.act = function () {
			var distance, direction, directions, coord;
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				distance = actor.coord.stepDistanceFrom(this.target.coord);
				directions = actor.coord.directionsThoward(this.target.coord);
				if (distance > 1 && distance !== 0) {
					actor.block.coord.direction = actor.stage.randomItem(actor.id, directions);
					actor.goNext(actor.coord.copy().move(actor.block.coord.direction));
				} else {
					// If the actor doesnt need to move, it checks if it is facing in the right direction
					if (directions.length) {
						direction = directions[0];
						if (direction !== actor.coord.direction) {
							coord = actor.coord.copy();
							coord.direction = direction;
							actor.goNext(coord);
						}
					}
				}
			}
			if (this.options.act) {
				this.options.act.call(this);
			}
		};
	};

	Compulsions.Escape = function Escape(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class

		this.resolveTarget = this.options.resolveTarget;
		this.target = null;

		this.weight = relativeWeightByMinMaxDistance;

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				var directions = actor.coord.directionsAway(this.target.coord);
				actor.block.coord.direction = actor.stage.randomItem(actor.id, directions);
				actor.goNext(actor.coord.copy().move(actor.block.coord.direction));
			}
		};
	};
	

	Compulsions.Attack = function Attack(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options, minDistance, maxDistance;

		this.resolveTarget = this.options.resolveTarget;
		this.target = null;

		this.weight = relativeWeightByMinMaxDistance;

		this.act = function () {
			// todo: find a better pattern than repeating the "mod" on stepInterval
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				this.actor.act("hit", this.target, {
					force: 1
				});
			}
			if (this.options.act) {
				this.options.act.call(this);
			}
		};
	};

})(Isomaton, jQuery, _);
