(function IsomatonCompulsionsPackage(Isomaton, $, _, undefined) {

	var Compulsions;
	Compulsions = Isomaton.Compulsions = {};

	function Compulsion(actor, _options) {
		this.options = _options || {};
		this.resolve = function () {
			return this.options.importance;
		};
	}
	Compulsions.WanderAtRandom = function WanderAtRandom(actor, _options) {
		Compulsion.apply(this, arguments); // Inherit from the Compulsion class
		var options, stepInterval;

		stepInterval = this.options["stepInterval"] || 1;

		this.act = function () {
			var mod = actor.stage.time % stepInterval;
			if (mod === 0) {
				// Move at random
				var direction = actor.stage.randomItem(actor.id, [0, 1, 2, 3]);
				actor.block.direction = direction;
				actor.nextCoord = actor.coord.copy().move(direction);
			}
		};
	};

})(Isomaton, jQuery, _);