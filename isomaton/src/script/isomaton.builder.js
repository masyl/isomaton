/*global Isomaton, _, PubSub */
(function IsomatonBlockPackage(Isomaton, _, undefined) {

	Isomaton.builder = {
		fill: fill,
		one: one,
		random: random,
		random4: random4
	};

	function one(type, coord) {
		var block = new Isomaton.Block(type, coord);
		return [block];
	}

	function fill(type, area) {
		var coord = area.coord;
		var blockCoord = new Isomaton.Coord(0, 0, 0);
		var x, y, z, block, blocks = [];
		for (x = coord.x; x < coord.x + area.width; x = x + 1) {
			for (y = coord.y; y < coord.y + area.height; y = y + 1) {
				blockCoord = new Isomaton.Coord(x, y, coord.z);
				block = new Isomaton.Block(type, blockCoord);
				blocks.push(block);
			}
		}
		return blocks;
	}

	function random(seed, type, area, count) {
		var i, iSeed, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
				iSeed = i + seed + "" + i;
				coord = area.randomCoord(iSeed);
				block = new Isomaton.Block(type, coord);
				blocks.push(block);
		}
		return blocks;
	}

	/**
	 * Return a collection of 4 blocks
	 * @param seed
	 * @param type
	 * @param area
	 * @param count
	 */
	function random4(seed, type, area, count) {
		var i, iSeed, coord, block, blocks = [];
		for (i = 0; i < count; i = i + 1) {
			iSeed = i + seed + "" + i;
			coord = area.randomCoord(iSeed);
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().north();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().east();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
			coord = coord.copy().south();
			block = new Isomaton.Block(type, coord);
			blocks.push(block);
		}
		return blocks;
	}

})(Isomaton, _);
