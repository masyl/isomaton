(function IsomatonRulesPackage(Isomaton, _, undefined) {

	Isomaton.Rules = {};

	Isomaton.Rules.CantWalkOnEmptyOrNonSolid = function CantWalkOnEmptyOrNonSolid() {
		var coord, blocks, isValidMove, stage;
		isValidMove = true;
		coord = this.nextCoord;
		stage = this.stage;
		// Test if next move is a step on a solid block
		blocks = stage.state.find({
			"class": "Block",
			"coord.x": coord.x,
			"coord.y": coord.y,
			"coord.z": coord.z - 1,
			"type.isSolid": true
		});
		if (!blocks.length) {
			isValidMove = false;
		}
		return isValidMove;
	};

	Isomaton.Rules.CantWalkIntoSolids = function CantWalkIntoSolids() {
		var i, block, coord, stage, blocks, isValidMove;
		isValidMove = true;
		// Test if next move is into a solid block
		coord = this.nextCoord;
		stage = this.stage;
		blocks = stage.state.find({
			"class": "Block",
			"coord.x": coord.x,
			"coord.y": coord.y,
			"coord.z": coord.z
		});
		if (blocks.length) {
			//todo: handle case where multiple blocks occupy the same space
			if (blocks[0].type.isSolid && blocks[0] !== this.block) {
				isValidMove = false;
			}
		}

		// Test if next move is into a space that WILL be occupied by a solid block
		blocks = stage.state.find({
			"class": "Block",
			"nextCoord.x": coord.x,
			"nextCoord.y": coord.y,
			"nextCoord.z": coord.z
		});

		for (i = 0; i < blocks.length; i = i + 1) {
			block = blocks[i];
			if (block.type.isSolid && block !== this.block) {
				isValidMove = false;
			}
		}

		return isValidMove;
	};

	
})(Isomaton, _);
