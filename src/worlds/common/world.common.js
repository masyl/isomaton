(function (tinycraft, Tinycraft){

	var world = tinycraft.worlds.common = new tinycraft.World(window.commonworld);

	var Coord = Tinycraft.Coord;
	var Area = tinycraft.Area;
	var builder = tinycraft.builder;

	var editModes = Tinycraft.editModes;

	world.entityTypes.Slime = tinycraft.EntityType("slime", {
		label: "Slime",
		blockType: world.blockTypes["actors.slime"],
		step: function slimeStep(stage) {
			var mod = stage.time % 8;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.entityTypes.Chicken = tinycraft.EntityType("chicken", {
		label: "Chicken",
		blockType: world.blockTypes["actors.chicken"],
		step: function chickenStep(stage) {
			var mod = stage.time % 8;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});


	world.entityTypes.Knight = tinycraft.EntityType("knight", {
		label: "Knight",
		blockType: world.blockTypes["actors.knight"],
		step: function knightStep(stage) {
			var mod = stage.time % 4;
			if (mod === 0) {
				// Move at random
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.entityTypes.Princess = tinycraft.EntityType("princess", {
		label: "Princess",
		blockType: world.blockTypes["actors.princess"],
		step: function princessStep(stage) {
			// Move at random
			var mod = stage.time % 6;
			if (mod === 0) {
				var direction = stage.randomItem(this.id, [0, 1, 2, 3]);
				this.nextCoord = this.coord.copy().move(direction);
			}
		}
	});

	world.stages.prairie = new Tinycraft.Stage("prairie", {
		start: function start() {
			var world = this.world;
			var worldOptions = world.options();
			console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var waterBlock = world.blockTypes["materials.water"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];
			var yellowflowersBlock = world.blockTypes["decorations.yellowflowers"];
			var shortweedsBlock = world.blockTypes["decorations.shortweeds"];
			var groundArea = new Area(new Coord(1, 1, -2), worldOptions.width, worldOptions.height);

			this.editMode(editModes.emptyFirst);

			// place layer of stone
			this.placeBlocks(builder.fill(stoneBlock, groundArea));

			// place layer of dirt
			groundArea.coord.up();
			this.placeBlocks(builder.fill(dirtBlock, groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.placeBlocks(builder.fill(grassBlock, groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(this.random("dirtPatchCount") * 9);
			this.placeBlocks(tinycraft.builder.random(this.random("dirtPatches"), dirtBlock, groundArea, dirtPatchCount));

			// place random patches of water in the grass at random
			var waterCount = Math.round(this.random("waterCount") * 9);
			this.placeBlocks(tinycraft.builder.random(this.random("grasses"), waterBlock, groundArea, waterCount));

			// Go up once to place stuff "on" the ground layer
			groundArea.coord.up();

			// place random yellow flowers
			var flowersCount = Math.round(this.random("flowersCount") * 9);
			this.placeBlocks(tinycraft.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));

			// place random weeds
			var weedCount = Math.round(this.random("weedCount") * 20);
			this.placeBlocks(tinycraft.builder.random(this.random("weeds"), shortweedsBlock, groundArea, weedCount));

			// place a gold block at random
			var randomCoord = groundArea.randomCoord(this.random("goldBlock"));
			this.placeBlocks(tinycraft.builder.one(goldBlock, randomCoord), true);

			// place 5 stones at random
			this.placeBlocks(tinycraft.builder.random(this.random("stones"), stoneBlock, groundArea, 25));

			// place 1 slime
			var slime = new world.entityTypes.Slime(groundArea.randomCoord(this.random("slimeCoord")));
			this.placeEntities([slime]);

			// place 2 chickens
			var chicken1 = new world.entityTypes.Chicken(groundArea.randomCoord(this.random("chickenCoord1")));
			var chicken2 = new world.entityTypes.Chicken(groundArea.randomCoord(this.random("chickenCoord2")));
			this.placeEntities([chicken1, chicken2]);

			// place 1 knight
			var knight = new world.entityTypes.Knight(groundArea.randomCoord(this.random("knightCoord")));
			this.placeEntities([knight]);

			// place 1 princess
			var princess = new world.entityTypes.Princess(groundArea.randomCoord(this.random("princessCoord")));
			this.placeEntities([princess]);

		},
		step: function prairieStep() {
		}
	});




})(window.tinycraft, window.Tinycraft);