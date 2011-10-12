(function (isomaton, Isomaton){

	var world = isomaton.worlds.common = new isomaton.World(window.commonworld);

	var Coord = Isomaton.Coord;
	var Compulsions = Isomaton.Compulsions;
	var Actor = Isomaton.Actor;
	var Area = isomaton.Area;
	var Rules = Isomaton.Rules;
	var builder = isomaton.builder;
	var editModes = Isomaton.editModes; // Constants



	world.Actors.Slime = function Slime(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "slime";
		this.label = "Slime";
		this.blockType = world.blockTypes["actors.slime"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			importance: 1,
			stepInterval: 8
		});
		this.init();
	};


	world.Actors.Chicken = function Chicken(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "chicken";
		this.label = "Chicken";
		this.blockType = world.blockTypes["actors.chicken"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			importance: 1,
			stepInterval: 5
		});
		this.init();
	};


	world.Actors.Knight = function Knight(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "knight";
		this.label = "Knight";
		this.blockType = world.blockTypes["actors.knight"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			importance: 1,
			stepInterval: 4
		});
		this.init();
	};

	world.Actors.Sidekick = function Sidekick(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "sidekick";
		this.label = "Sidekick";
		this.blockType = world.blockTypes["actors.sidekick"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			importance: 1,
			stepInterval: 5
		});
		this.init();
	};

	world.Actors.Princess = function Princess(options) {
		Actor.apply(this, arguments); // Inherit from the Actor class
		this.type = "princess";
		this.label = "Princess";
		this.blockType = world.blockTypes["actors.princess"];
		this.compulsions.WanderAtRandom = new Compulsions.WanderAtRandom(this, {
			importance: 1,
			stepInterval: 8
		});
		this.init();
	};

	world.stages.prairie = new Isomaton.Stage("prairie", {
		start: function start() {
			var coord;
			var world = this.world;
			var worldOptions = world.options();
			//console.log("placing blocks...");

			var grassBlock = world.blockTypes["materials.grass"];
			var waterBlock = world.blockTypes["materials.water"];
			var dirtBlock = world.blockTypes["materials.dirt"];
			var goldBlock = world.blockTypes["materials.gold"];
			var stoneBlock = world.blockTypes["materials.stone"];
			var yellowflowersBlock = world.blockTypes["decorations.yellowflowers"];
			var shortweedsBlock = world.blockTypes["decorations.shortweeds"];
			var groundArea = new Area(new Coord(1, 1, -2), worldOptions.width, worldOptions.height);

			var whiteFrameBlock = world.blockTypes["cursors.whiteplaceholder"];
			var frameArea = new Area(new Coord(1, -3, 6), worldOptions.width, 1);
			this.placeBlocks(builder.fill(whiteFrameBlock, frameArea));

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
			this.placeBlocks(isomaton.builder.random(this.random("dirtPatches"), dirtBlock, groundArea, dirtPatchCount));

			// place random patches of water in the grass at random
			var waterCount = Math.round(this.random("waterCount") * 9);
			this.placeBlocks(isomaton.builder.random4(this.random("water"), waterBlock, groundArea, waterCount));

			// Go up once to place stuff "on" the ground layer
			groundArea.coord.up();

			// place random yellow flowers
			var flowersCount = Math.round(this.random("flowersCount") * 9 + 3);
			this.placeBlocks(isomaton.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));

			// place random weeds
			var weedCount = Math.round(this.random("weedCount") * 20 + 3);
			this.placeBlocks(isomaton.builder.random(this.random("weeds"), shortweedsBlock, groundArea, weedCount));

			// place a gold block at random
			var randomCoord = groundArea.randomCoord(this.random("goldBlock"));
			this.placeBlocks(isomaton.builder.one(goldBlock, randomCoord), true);

			// place 5 stones at random
			this.placeBlocks(isomaton.builder.random(this.random("stones"), stoneBlock, groundArea, 5));

			// place 1 slime
			coord = groundArea.randomCoord(this.random("slimeCoord"));
			var slime = new world.Actors.Slime().bind(this, coord);
			this.placeActors([slime]);

			// place 2 chickens
			coord = groundArea.randomCoord(this.random("chickenCoord1"));
			var chicken1 = new world.Actors.Chicken().bind(this, coord);
			coord = groundArea.randomCoord(this.random("chickenCoord2"));
			var chicken2 = new world.Actors.Chicken().bind(this, coord);
			this.placeActors([chicken1, chicken2]);

			// place 1 knight
			coord = groundArea.randomCoord(this.random("knightCoord"));
			var knight = new world.Actors.Knight(coord).bind(this, coord);
			this.placeActors([knight]);

			// place 1 sidekick
			coord = groundArea.randomCoord(this.random("sidekickCoord"));
			var sidekick = new world.Actors.Sidekick(coord).bind(this, coord);
			this.placeActors([sidekick]);

			// place 1 princess
			coord = groundArea.randomCoord(this.random("princessCoord"));
			var princess = new world.Actors.Princess().bind(this, coord);
			this.placeActors([princess]);

			// place frame
			this.placeBlocks(isomaton.builder.random(this.random("flowers"), yellowflowersBlock, groundArea, flowersCount));


		},
		step: function prairieStep() {
		}
	});




})(window.isomaton, window.Isomaton);