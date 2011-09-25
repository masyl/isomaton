(function (tinycraft){


	var world = tinycraft.worlds.common = new tinycraft.World(window.commonworld);

	var Coord = tinycraft.Coord;
	var Area = tinycraft.Area;
	var builder = tinycraft.builder;

	world.entities.knight = new tinycraft.Entity("knight", {
		label: "Player",
		blockset: "actors",
		blocktype: "blackknight",
		tick: function (stage, world) {

		}
	});


	world.stages.prairie = new tinycraft.Stage("prairie", {
		start: function () {
			console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];

			var groundArea = new Area(new Coord(-8, -8, -20), 16, 16);

			// place layer of stone
			this.place(builder.fill(stoneBlock, groundArea));

			// place layer of dirt
			groundArea.coord.up();
			this.place(builder.fill(dirtBlock, groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.place(builder.fill(grassBlock, groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(Math.random() * 9);
			this.place(tinycraft.builder.random(dirtBlock, groundArea, dirtPatchCount));

			// place a gold block at random
			groundArea.coord.up();
			var randomCoord = groundArea.randomCoord();
			console.log("random coord", randomCoord);
			this.place(tinycraft.builder.one(goldBlock, groundArea.randomCoord()));

			// place 5 stones at random
			this.place(tinycraft.builder.random(stoneBlock, groundArea, 5));


			// set player spawn point at center
			this.spawn(0, 0);
		}
	});




})(window.tinycraft);