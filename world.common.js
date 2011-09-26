(function (tinycraft){


	var world = tinycraft.worlds.common = new tinycraft.World(window.commonworld);

	var Coord = tinycraft.Coord;
	var Area = tinycraft.Area;
	var builder = tinycraft.builder;

	world.entityTypes.Slime = tinycraft.EntityType("slime", {
		label: "Slime",
		blockType: world.blockTypes["actors.slime"],
		step: function (stage, world) {
//			this.coord.up();
		}
	});

	world.stages.prairie = new tinycraft.Stage("prairie", {
		start: function () {
			var worldOptions = world.options();
			console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];
			var groundArea = new Area(new Coord(0, 0, -2), worldOptions.width, worldOptions.height);

			// place layer of stone
			this.placeBlocks(builder.fill(stoneBlock, groundArea));

			// place layer of dirt
			groundArea.coord.up();
			this.placeBlocks(builder.fill(dirtBlock, groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.placeBlocks(builder.fill(grassBlock, groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(Math.random() * 9);
			this.placeBlocks(tinycraft.builder.random(dirtBlock, groundArea, dirtPatchCount));

			// place a gold block at random
			groundArea.coord.up();
			var randomCoord = groundArea.randomCoord();
			console.log("random coord", randomCoord);
			this.placeBlocks(tinycraft.builder.one(goldBlock, groundArea.randomCoord()));

			// place 5 stones at random
			this.placeBlocks(tinycraft.builder.random(stoneBlock, groundArea, 5));

			// place 1 slime entity
			
			var slime = new world.entityTypes.Slime(groundArea.randomCoord());
			this.placeEntities([slime]);

			// set player spawn point at center
			this.spawn(0, 0);
		},
		step: function (world) {
		}
	});




})(window.tinycraft);