
(function TinycraftIsographPackage(Tinycraft, $, _, undefined){

	Tinycraft.Isograph = function Isograph(options) {
		var isograph = this;

		this._options = {};
		this.currentFocus = null;
		this.stepSpeed = 0;
		this.sprites = null;
		this.blockBitmaps = null;
		window.dbBlocks = this.dbBlocks = new Minidb();

		this.init = function () {
			var canvas;
			this.options(options);

			// todo: get root target from options
			// create stage and point it to the canvas:
			canvas = $("#tinycraft").find("canvas.isograph")[0];
			this.blockBitmaps = new Container();
			this.stage = new Stage(canvas);

			// todo: update how the focus and selection of blocks is done

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.updateBlock = function (block) {
			var $elem, speed, coord;
			speed = this.stepSpeed * 0.8;
			coord = this.translateFromISO(block.coord);
			this.updateBlockBitmap(block.bitmap, coord.x, coord.y, coord.z, speed);
		};

		this.updateBlockBitmap = function(bitmap, x, y, z, speed) {
			bitmap.x = x;
			bitmap.y = y;
			bitmap.z = z;
			this.updateZ();
		};

		this.updateZ = function() {
			this.blockBitmaps.sortChildren(function (a, b) {
				return a.z - b.z;
			});
		};



		this.placeBlocks = function (blocks) {
			var
					i,
					block;
			for (i in blocks) {
				block = blocks[i];
				this.dbBlocks.add(block);
			}
		};

		this.removeBlocks = function (blocks) {
			var
					i,
					filter,
					block,
					isographBlock;
			for (i in blocks) {
				block = blocks[i];
				filter = {
					"x": block.coord.x,
					"y": block.coord.y,
					"z": block.coord.z
				};
				isographBlock = this.dbBlocks.get(filter);
				if (isographBlock) {
					// These blocks might or not be already drawn on the isograph
					this.blockBitmaps.removeChild(block.bitmap);
					this.dbBlocks.remove(block);
				}
			}
		};

		/**
		 * Convert isometric coordinates to pixel positions
		 * @param coord
		 */
		this.translateFromISO = function (coord, flipX, flipY) {
			var x, y, z, coordX, coordY, coordZ, newCoord;
			var skin = options.skin;

			coordX = coord.x;
			coordY = coord.y;
			coordZ = coord.z;
			if (flipX) coordX = -coordX;
			if (flipY) coordY = -coordY;

			x = (coordY - coordX) * skin.isoWidth;
			y = (coordY + coordX) * skin.isoTopHeight - (coordZ * skin.isoBlockHeight);
			z = (coordX + coordY) * 10 + coordZ;

			// Apply Stage offset
			x = x + skin.stageOffsetX;
			y = y + skin.stageOffsetY;

			newCoord = {
				x: x,
				y: y,
				z: z
			};
			return newCoord;
		};


		/**
		 * Convert pixel position to Isometric coordinates
		 * @param mouseX
		 * @param mouseY
		 */
		this.translateToISO = function (mouseX, mouseY) {
			var _x, _y, x, y, coord, skin;
			skin = options.skin;

			x = mouseX - skin.stageOffsetX - (skin.isoWidth);
			y = mouseY - skin.stageOffsetY + 7;

			y = y / (skin.isoTopHeight * 2);
			x = -(x / skin.isoWidth);

			_y = parseInt((2 * y - x) / 2);
			_x = parseInt(x + _y);

			coord = new Tinycraft.Coord(_x, _y, 0);
			return coord;
		};

		/**
		 * Setup the initiale stage of the stage by loading sprites, creating the stage,
		 * containers and initial bitmaps
		 */
		this.setup = function() {
			// todo: rename stage

			var i, block, blocks, $blockElement, canvas, stage;
			blocks = this.dbBlocks.get({
				"class": "Block"
			});

			stage = this.stage;

			stage.addChild(this.blockBitmaps);
			stage.mouseEnabled = true;

/*
			// attach mouse handlers directly to the source canvas:
			stage.onmousemove = onMouseMove;
			canvas.onmousedown = onMouseDown;
			canvas.onmouseup = onMouseUp;
*/

			this.loadSprites(onSpritesLoaded);

			function onSpritesLoaded() {
				var bitmap, image, coord;

				//console.log("Adding block bitmaps");
				//console.log("sprites: ", isograph.sprites);
				//console.log(isograph.spritesImage);

				// Create all block bitmaps
				for (i in blocks) {
					block = blocks[i];
					coord = isograph.translateFromISO(block.coord);
					bitmap = new BitmapSequence(isograph.sprites);
					bitmap.gotoAndStop(block.type.offset);
					bitmap.x = coord.x;
					bitmap.y = coord.y;
					bitmap.z = coord.z;
					block.bitmap = bitmap;
					isograph.blockBitmaps.addChild(bitmap);
				}

				isograph.updateZ();
				// todo: get the fps from options
				Ticker.setFPS(5);		// in ms, so 20 fps

				// assign a tick listener directly to this window:
				Ticker.addListener({
					tick: function () {
						stage.update();
					}
				});
			}
		};

		this.loadSprites = function(callback) {
			var image, skin;
			skin = options.skin;
			image = new Image();
			
			image.onload = function onload() {
				var spriteCount, frameData;
				// Create the spriteSheet
				isograph.sprites = new SpriteSheet(
					image,
					skin.spritesWidth,
					skin.spritesHeight
				);
				callback();
			};
			image.onerror = function onerror() {
				console.error("Isograph: Sprites failed to load: ", this);
			};
			image.src = skin.spritesURL;
			isograph.spritesImage = image;
		};

		this.init();
	}

})(Tinycraft, jQuery, _);