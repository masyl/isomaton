(function IsomatonCompulsionsPackage(Isomaton, $, _, undefined) {

	var Compulsions;
	Compulsions = Isomaton.Compulsions = {};

	function Compulsion(actor, _options) {
		this.options = _options || {};
		// Weight factors take the form of a two item array, the first is the multiply factor and the second
		// is the addition factor
		var weightFactors = this.weightFactors = this.options.weight || [1,0];

		this.stepInterval = this.options.stepInterval || 1;
		this.minDistance = this.options.minDistance || 1;
		this.maxDistance = this.options.maxDistance || 10;

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


	Compulsions.WanderAtRandom = function WanderAtRandom(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options;

		this.stepInterval = this.options["stepInterval"] || 1;

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				// Move at random
				var direction = actor.stage.randomItem(actor.id, [0, 1, 2, 3]);
				actor.block.direction = direction;
				actor.nextCoord = actor.coord.copy().move(direction);
			}
		};
	};

	Compulsions.Follow = function Follow(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options, minDistance, maxDistance;

		this.prey = null;

		this.weight = function () {
			var i, targets, target, targetWeight, bestTarget, bestTargetWeight, distance;
			targets = actor.stage.actors.all().get();
			targetWeight = 0;
			bestTargetWeight = 0;
			// Find a prey to follow
			for (i = 0; i < targets.length; i = i + 1) {
				target = targets[i];
				// todo: move distance calculation into a Coord class method
				distance = Math.abs(actor.coord.x - target.coord.x) + Math.abs(actor.coord.y - target.coord.y);
				targetWeight = this.options.resolvePrey.call(this, target, distance);
				if (targetWeight > bestTargetWeight) {
					bestTarget = target;
					bestTargetWeight = targetWeight;
				}
			}
			this.prey = bestTarget;
			return bestTargetWeight;
		};

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				var directions = [];
				if (actor.coord.x > this.prey.coord.x) {
					directions.push(2);
				} else if (actor.coord.x < this.prey.coord.x) {
					directions.push(0);
				} else {
					directions.push(actor.stage.randomItem(actor.id + "-hunt", [0,2]));
				}
				if (actor.coord.y > this.prey.coord.y) {
					directions.push(3);
				} else if (actor.coord.y < this.prey.coord.y) {
					directions.push(1);
				} else {
					directions.push(actor.stage.randomItem(actor.id + "-hunt", [3,1]));
				}
				actor.block.direction = actor.stage.randomItem(actor.id, directions);
				actor.nextCoord = actor.coord.copy().move(actor.block.direction);
			}
		};
	};

	Compulsions.Escape = function Escape(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options;

		this.stepInterval = this.options["stepInterval"] || 1;

		this.prey = null;

		this.weight = function () {
			var i, preys, prey, preyWeight, bestPrey, bestPreyWeight, distance;
			preys = actor.stage.actors.all().get();
			preyWeight = 0;
			bestPreyWeight = 0;
			// Find a prey to follow
			for (i = 0; i < preys.length; i = i + 1) {
				prey = preys[i];
				// todo: move distance calculation into a Coord class method
				distance = Math.abs(actor.coord.x - prey.coord.x) + Math.abs(actor.coord.y - prey.coord.y);
				preyWeight = this.options.resolvePrey.call(this, prey, distance);
				if (preyWeight > bestPreyWeight) {
					bestPrey = prey;
					bestPreyWeight = preyWeight;
				}
			}
			this.prey = bestPrey;
			return bestPreyWeight;
		};

		this.act = function () {
			var mod = actor.stage.time % this.stepInterval;
			if (mod === 0) {
				var directions = [];
				if (actor.coord.x > this.prey.coord.x) {
					directions.push(0);
				} else if (actor.coord.x < this.prey.coord.x) {
					directions.push(2);
				} else {
					directions.push(actor.stage.randomItem(actor.id + "-escape", [0, 2]));
				}
				if (actor.coord.y > this.prey.coord.y) {
					directions.push(1);
				} else if (actor.coord.y < this.prey.coord.y) {
					directions.push(3);
				} else {
					directions.push(actor.stage.randomItem(actor.id + "-escape", [1, 3]));
				}
				actor.block.direction = actor.stage.randomItem(actor.id, directions);
				actor.nextCoord = actor.coord.copy().move(actor.block.direction);
			}
		};
	};

})(Isomaton, jQuery, _);