(function IsomatonBlockPackage(Isomaton, _, undefined) {

	// Base class for blocks
	Isomaton.Block = function Block(type, coord, offStage, group) {
		Bobify(this, {
			uid: uid,
			index: index
		}); // Add basic bob functionnalities to this object

		//todo: become a pubSub and publish on update to the miniDb for blocks
		this.id = _.uniqueId();
		this["class"] = "Block";
		this.type = type;
		this.coord = coord;
		this.group = group || "";
		this.nextCoord = null;
		this.prevCoord = null;
		this.offStage = (offStage === undefined) ? true : offStage;

		this.goNext = function goNext(coord) {
			this.nextCoord = coord;
		};

		this.go = function go(coord) {
			// todo: manage a better coord history queue
			if (this.nextCoord) {
				this.prevCoord = this.coord;
				this.coord = this.nextCoord;
				this.nextCoord = null;
			}
		};

		this.blur = function blur() {
			if (this.actor) {
				this.actor.blur();
			}
		};

		this.focus = function focus() {
			if (this.actor) {
				this.actor.focus();
			}
		};

		this.select = function select() {
			if (this.actor) {
				this.actor.select();
			}
		};

		this.serializer = function (json) {
			if (json) {

			} else {

			}
		};

		function uid() {
			return this["class"] + "-" + this.id;
		}

		function index() {
			var attrs = {
				"class": this["class"],
				"id": this.id,
				"offStage": this.offStage,
				"group": this.group,
				"type.id": this.type.id,
				"type.isSolid": this.type.isSolid,
				"coord.x": this.coord.x,
				"coord.y": this.coord.y,
				"coord.z": this.coord.z
			};
			if (this.nextCoord) {
				attrs["nextCoord.x"] = this.nextCoord.x;
				attrs["nextCoord.y"] = this.nextCoord.y;
				attrs["nextCoord.z"] = this.nextCoord.z;
			}
			return attrs;
		}
	};

	Isomaton.BlockType = function BlockType(id, options) {
		this.id = id;
		this.offset = options.offset || 0;
		// todo: use an extend method instead of this idiotic approach...
		this.isSolid = this.isSolid = (options.isSolid !== undefined) ? options.isSolid : true;
		this.isAnimated = this.isAnimated = (options.isAnimated !== undefined) ? options.isAnimated : false;
		this.loop = this.loop = (options.loop !== undefined) ? options.loop : false;
		this.frames = this.frames = (options.frames !== undefined) ? options.frames : true;

		// true is this block has its own spritesheet
		this.hasOwnSpriteSheet = (options.hasOwnSpriteSheet !== undefined) ? options.hasOwnSpriteSheet : false;
	};

	Isomaton.BlockSet = function BlockSet(id, options) {
		var blockType, typeId;
		this.id = id;
		this.offset = options.offset;
		this.blockTypes = {};
		for (typeId in options.blocks) {
			blockType = new Isomaton.BlockType(typeId, options.blocks[typeId]);
			// Adjust the offset of the blockType with the offset of its set
			this.blockTypes[typeId] = blockType;
			blockType.offset = blockType.offset + this.offset;

		}
	};


})(Isomaton, _);
