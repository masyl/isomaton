/*global Isomaton, _, PubSub, Bobify */
(function IsomatonBlockPackage(Isomaton, _, Bobify, undefined) {

	// Base class for blocks
	Isomaton.Block = function Block(type, coord, offStage, group) {
		// Add basic bob functionnalities to this object
		Bobify(this, {
			index: function index() {
				var attrs = {
					"class": this["class"],
					"uid": this["class"] + "-" + this.id,
					"id": this.id,
					"offStage": this.offStage,
					"isPickable": this.isPickable,
					"group": this.group,
					"type.id": this.type.id,
					"type.isSolid": this.type.isSolid,
					"type.isStackable": this.type.isStackable,
					"type.isOffstage": this.type.isOffstage,
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
		});

		//todo: become a pubSub and publish on update to the miniDb for blocks
		// Initialise the block with default attributes
		this.set({
			id: _.uniqueId(),
			"class": "Block",
			type: type,
			isPickable: type.isPickable,
			coord: coord.copy(),
			group: group || "",
			nextCoord: null,
			prevCoord: null,
			offStage: (offStage === undefined) ? true : offStage
		});

		this.goNext = function goNext(coord) {
			this.set({
				nextCoord: coord
			});
			return this;
		};

		this.go = function go() {
			// todo: manage a better coord history queue
			if (this.nextCoord) {
				this.set({
					prevCoord: this.coord,
					coord: this.nextCoord,
					nextCoord: null
				});
			}
			return this;
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

	};

	Isomaton.BlockType = function BlockType(id, options) {
		this.id = id;
		this.offset = options.offset || 0;
		// todo: use an extend method instead of this idiotic approach...
		this.isSolid = this.isSolid = (options.isSolid !== undefined) ? options.isSolid : true;
		this.isAnimated = this.isAnimated = (options.isAnimated !== undefined) ? options.isAnimated : false;
		this.isPickable = this.isPickable = (options.isPickable !== undefined) ? options.isPickable : false;
		this.isStackable = this.isStackable = (options.isStackable !== undefined) ? options.isStackable : false;
		this.isOffstage = this.isOffstage = (options.isOffstage !== undefined) ? options.isOffstage : false;
		this.loop = this.loop = (options.loop !== undefined) ? options.loop : false;
		this.frames = this.frames = (options.frames !== undefined) ? options.frames : true;
		this.isInvisible = this.isInvisible = (options.isInvisible !== undefined) ? options.isInvisible : false;
		this.shape = this.shape = (options.shape !== undefined) ? options.shape : "fullBlock";

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


})(Isomaton, _, Bobify);
