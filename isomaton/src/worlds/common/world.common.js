(function (isomaton, I) {

	var Actors, Blocks, world;

	Blocks = Isomaton.Blocks;
	Actors = Isomaton.Actors;

	// todo: worl instantiation makes no sense
	world = isomaton.worlds.common = new isomaton.World(window.commonworld);

	// todo: Replace this "setup" approach with seed blocks
	// todo: The initial content of the world should be declarative, not code
	// todo: Take a "Smart Pieces + Easy assembly" approach
	world.stages.prairie = new I.Stage("prairie", {
		start: function start() {
			var coord;
			var world = this.world;
			var worldOptions = world.options();
			var groundArea = new I.Area(new I.Coord(1, 1, -2), worldOptions.width, worldOptions.height);

			this.editMode(I.editModes.emptyFirst);

			// place layer of stone
			// todo: bring back this layer once isograph is optimized
//			this.placeBlocks(I.builder.fill(Blocks["materials.stone"], groundArea));

			// place layer of dirt
			groundArea.coord.up();
			// todo: bring back this layer once isograph is optimized
//			this.placeBlocks(I.builder.fill(Blocks["materials.dirt"], groundArea));

			// place layer of grass
			groundArea.coord.up();
			this.placeBlocks(I.builder.fill(Blocks["materials.grass"], groundArea));

			// place random patches of dirt in the grass at random
			var dirtPatchCount = Math.round(this.random("dirtPatchCount") * 9);
			this.placeBlocks(I.builder.random(this.random("dirtPatches"), Blocks["materials.dirt"], groundArea, dirtPatchCount));

			// place random patches of water in the grass at random
			var waterCount = Math.round(this.random("waterCount") * 9);
			this.placeBlocks(I.builder.random4(this.random("water"), Blocks["materials.water"], groundArea, waterCount));

			// Go up once to place stuff "on" the ground layer
			groundArea.coord.up();

			// place random yellow flowers
			var flowersCount = 8;//Math.round(this.random("flowersCount") * 9 + 3);
			this.placeBlocks(I.builder.random(this.random("flowers"), Blocks["decorations.yellowflowers"], groundArea, flowersCount));

			// place random weeds
			var weedCount = 24;//Math.round(this.random("weedCount") * 20 + 3);
			this.placeBlocks(I.builder.random(this.random("weeds"), Blocks["decorations.shortweeds"], groundArea, weedCount));

			// place a gold block at random
			var randomCoord = groundArea.randomCoord(this.random("goldBlock"));
			this.placeBlocks(I.builder.one(Blocks["materials.gold"], randomCoord));

			// place 5 stones at random
			this.placeBlocks(I.builder.random(this.random("stones"), Blocks["materials.stone"], groundArea, 5));

			// place 1 slime
			coord = groundArea.randomCoord(this.random("slimeCoord"));
			var slime = new Actors.Slime().bind(this, coord);
//			this.placeActors([slime]);

			// place the cursor at the center of the stage
			var cursor = new Actors.Cursor().bind(this, new Isomaton.Coord(10, 10, 1, 0));
				this.placeActors([cursor]);

			// place 2 tiny slime
			var tinySlime;
			coord = groundArea.randomCoord(this.random("tinySlimeCoord"));
			tinySlime = new Actors.TinySlime().bind(this, coord);
//			this.placeActors([tinySlime]);

			coord = groundArea.randomCoord(this.random("tinySlimeCoord2"));
			tinySlime = new Actors.TinySlime().bind(this, coord);
//			this.placeActors([tinySlime]);

			// place 4 chickens
			coord = groundArea.randomCoord(this.random("chickenCoord1"));
			var chicken1 = new Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord2"));
			var chicken2 = new Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord3"));
			var chicken3 = new Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord4"));
			var chicken4 = new Actors.Chicken().bind(this, coord);
//			this.placeActors([chicken1, chicken2, chicken3, chicken4]);

			// place 1 knight
			coord = groundArea.randomCoord(this.random("knightCoord"));
			var knight = new Actors.Knight().bind(this, coord);
			this.placeActors([knight]);

			// place 1 sidekick
			coord = groundArea.randomCoord(this.random("sidekickCoord"));
			var sidekick = new Actors.Sidekick().bind(this, coord);
//			this.placeActors([sidekick]);

			// place 1 princess
			coord = groundArea.randomCoord(this.random("princessCoord"));
			var princess = new Actors.Princess().bind(this, coord);
//			this.placeActors([princess]);

			// place 12 spawn points
			var i, spawnPoints = [];
			for (i = 0; i < 20; i = i + 1) {
				coord = groundArea.randomCoord(this.random("spawnCoords-" + i));
				spawnPoints.push(new Actors.SpawnPoint().bind(this, coord));
			}
//			this.placeActors(spawnPoints);

			// place frame
//			this.placeBlocks(I.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));


		},
		step: function prairieStep() {
		}
	});




})(window.isomaton, window.Isomaton);
