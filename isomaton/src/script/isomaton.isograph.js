(function IsomatonIsographPackage(Isomaton, _, undefined){

	Isomaton.Isograph = function Isograph(options) {
		var isograph = this;
		mixinPubSub(this);

		this._options = {};
		this.stepSpeed = 0;
		this.blocks = null;
		this.sprites = null;
		this.blockBitmaps = null;
		this.blockTypes = null;

		this.init = function () {
			var canvasStage, canvas;
			this.options(options);

			// todo: get root target from options
			// create stage and point it to the canvas:
			canvas = options.canvas;
			this.blockTypes = options.blockTypes;
			this.blockBitmaps = new Container();

			canvasStage = this.canvasStage = new Stage(canvas);
			this.canvas = canvas;
			canvasStage.mouseEnabled = true;

			// attach mouse handlers directly to the source canvas:
			canvas.onmousemove = this.onMouseMove;
			canvas.onmousedown = this.onMouseDown;
			canvas.onmouseup = this.onMouseUp;

			// todo: update how the focus and selection of blocks is done

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.mouseTick = function mouseTick () {
			var mouseTarget;
			var offset = new Point();

			// if we were dragging, but are not anymore, call mouseOut with the old target:
			if (!this.mouseIsDown && mouseTarget) {
				this.onMouseOut(mouseTarget);
				this.mouseIsDown = false;
			}

			// if we're not currently dragging, and have valid mouseX and mouseY values, check for objects under mouse:
			if (!this.mouseIsDown && this.mouseX && this.mouseY) {
				// when running local files, most browsers throw a security error when reading pixel data
				// (which getObjectUnderPoint uses) so we'll put it in a try/catch block:

				var t = (new Date()).getTime();
				mouseTarget = this.canvasStage.getObjectUnderPoint(this.mouseX, this.mouseY);
				try {
					// this will return the top-most display object under the mouse position:
				} catch (e) {
					Ticker.removeListener(window);
					alert("An error occurred because this browser does not support reading pixel data in local files. Please read 'SECURITY_ERROR_README.txt' included with the EaselJS for details");
				}
				if (mouseTarget && mouseTarget !== this.mouseTarget) {
					// if we found a target, call mouseOver with it:
					var oldMouseTarget = this.mouseTarget;
					this.mouseTarget = mouseTarget;
					if (oldMouseTarget) {
						this.onMouseOut(oldMouseTarget);
					}
					if (mouseTarget) {
						this.onMouseOver(mouseTarget);
					}
					/*
					offset.x = mouseTarget.x - this.mouseX;
					offset.y = mouseTarget.y - this.mouseY;
					*/
				}
			}

			// if we're currently dragging something, update it's x/y:
			/*
			if (this.dragStarted && mouseTarget) {
				// pop it to the top of the display list:
				this.canvasStage.addChild(mouseTarget);
				mouseTarget.x = this.mouseX + offset.x;
				mouseTarget.y = this.mouseY + offset.y;
			}
			*/

		};

		this.onMouseMove = function onMouseMove(e) {
			if (!e) { e = window.event; }
			isograph.mouseX = e.pageX - this.offsetLeft;
			isograph.mouseY = e.pageY - this.offsetTop;
		};
		this.onMouseDown = function onMouseDown(e) {
			if (!e) { e = window.event; }
			isograph.mouseIsDown = true;
			if (isograph.mouseTarget) {
				isograph.mouseTarget.block.select();
				isograph.publish("blockSelect", [isograph.mouseTarget.block]);
			}
		};
		this.onMouseUp = function onMouseUp(e) {
			if (!e) { e = window.event; }
			isograph.mouseIsDown = false;
		};
		this.onMouseOver = function onMouseOver(bitmap) {
			bitmap.block.focus();
		};
		this.onMouseOut = function onMouseOut(bitmap) {
			bitmap.block.blur();
		};



		this.updateBlock = function (block) {
			var speed, coord;
			if (block.coord !== block.animatedCoord) {
				block.animatedCoord = block.coord;
				coord = this.translateFromISO(block.coord);
				if (block.coord.stepDistanceFrom(block.prevCoord) > 1) {
					speed = 0;
				} else {
					speed = this.stepSpeed * 2;
				}
				if (block.bitmap) {
					if (block.type.hasOwnSpriteSheet) {
						block.bitmap.gotoAndStop(block.coord.direction);
					}
					this.updateBlockBitmap(block.bitmap, coord.x, coord.y, coord.z, speed);
				}
			}
		};

		this.updateBlockBitmap = function(bitmap, x, y, z, speed) {
			// If the bitmap if moving higher/forward the z index
			// update the z-ordering first
			if (z > bitmap.z) {
				bitmap.z = z;
				// todo: find a cheaper way to update the z-ordering
//				this.updateZ();
				Tween.get(bitmap)
					.to({
							x: x,
							y: y
						}, speed);
			} else {
				Tween.get(bitmap)
					.to({
							x: x,
							y: y
						}, speed)
					.to({z: z}, 0.01)
					.call(function() {
//						isograph.updateZ();
					});
			}
		};

		this.updateDepth = function() {
			this.blockBitmaps.sortChildren(function (a, b) {
				return a.z - b.z;
			});
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

			coord = new Isomaton.Coord(_x, _y, 0);
			return coord;
		};

		this.renderBlock = function renderBlock(block) {
			var bitmap, type, coord;
			type = block.type;
			coord = isograph.translateFromISO(block.coord);
			if (type.hasOwnSpriteSheet) {
				bitmap = new BitmapSequence(type.spritesheet);
				if (type.isAnimated) {
					// todo: animation for each directions
					bitmap.gotoAndPlay("main");
				} else {
					bitmap.gotoAndStop(block.coord.direction);
				}
			} else {
				bitmap = new BitmapSequence(isograph.sprites);
				bitmap.gotoAndStop(type.offset);
			}
			// Add a reference to its block (for later use on focus/blur events)
			bitmap.block = block;
			bitmap.x = coord.x;
			bitmap.y = coord.y;
			bitmap.z = coord.z;
			block.bitmap = bitmap;
			isograph.blockBitmaps.addChild(bitmap);
		};


		this.bind = function bind(blocks) {
			this.blocks = blocks;
			this.blocks.subscribe("add", function(blocks) {
				var i, block;
				for (i in blocks) {
					block = blocks[i];
					isograph.renderBlock(block);
				}
			});
			this.blocks.subscribe("remove", function(blocks) {
				var i, block;
				for (i in blocks) {
					block = blocks[i];
					if (block.bitmap) {
						isograph.blockBitmaps.removeChild(block.bitmap);
					} else {
						console.log("block is missing bitmap", block, block.id, block.toString(), block.bitmap);
					}
				}
			});
			this.blocks.subscribe("update", function(blocks) {
				var i, block;
				for (i in blocks) {
					block = blocks[i];
					isograph.updateBlock(block);
				}
			});
		};

		/**
		 * Setup the initiale stage of the stage by loading sprites, creating the stage,
		 * containers and initial bitmaps
		 */
		this.setup = function(callback) {

			var canvasStage;
			canvasStage = this.canvasStage;
			canvasStage.addChild(this.blockBitmaps);
			canvasStage.mouseEnabled = true;

			this.loadSprites(onSpritesLoaded);

			function onSpritesLoaded() {
				// Set the desired FPS
				Ticker.setFPS(12); // todo: get the fps from options
				// assign a tick listener directly to this window:
				Ticker.addListener({
					tick: function () {
						isograph.frameStep();
					}
				});
				callback();
			}
		};

		/**
		 * Go through one frame redraw
		 */
		this.frameStep = function frameStep() {
			// Run the mouse event handler
			this.mouseTick();
			// Update the depth ordering (onscreen z) before redrawing
			isograph.updateDepth();
			// Update the canvas scene graph
			this.canvasStage.update();
		};

		this.loadSprites = function(callback) {
			var
					mainSpritesheetIsReady = false,
					spritesheet,
					blockType,
					sprites,
					image,
					skin;
			skin = options.skin;
			sprites = [skin.spritesURL];


			function checkIfDone() {
				var isDone;
				isDone = _(isograph.blockTypes).all(function (blockType) {
					return blockType.spritesheetReady === true;
				});
				if (isDone && mainSpritesheetIsReady) {
					callback();
				}

			}

			// load block sprites
			_(isograph.blockTypes).each(function(blockType) {
				var spritesheetImage;

				if (blockType.hasOwnSpriteSheet) {
					spritesheetImage = blockType.spritesheetImage = new Image();
					spritesheetImage.onload = function () {
						ownSpritesheetLoaded(blockType);
					};
					spritesheetImage.onerror = ownSpritesheetError;
					spritesheetImage.src = "../src/worlds/common/sprites/" + blockType.id + ".png";
					blockType.spritesheetReady = false;
				} else {
					blockType.spritesheetReady = true;
				}

				function ownSpritesheetLoaded(blockType) {
					var frameData, loopString;
					if (blockType.isAnimated) {
						loopString = (blockType.loop) ? "main" : false;
						frameData = {
								main: [0, blockType.frames - 1, loopString]
						};
					}
					blockType.spritesheet = new SpriteSheet(
						spritesheetImage,
						skin.spritesWidth,
						skin.spritesHeight,
						frameData
					);
					blockType.spritesheetReady = true;
					checkIfDone();
				}

				function ownSpritesheetError () {
					console.error("Isograph: Sprites failed to load: ", this);
				}


			});


			// load the common spritesheet
			image = new Image();
			image.onload = function onload() {
				// Create the spriteSheet
				isograph.sprites = new SpriteSheet(
					image,
					skin.spritesWidth,
					skin.spritesHeight
				);
				mainSpritesheetIsReady = true;
				checkIfDone();
			};
			image.onerror = function onerror() {
				console.error("Isograph: Sprites failed to load: ", this);
			};
			image.src = skin.spritesURL;
			isograph.spritesImage = image;
		};

		this.init();
	}

})(Isomaton, _);
