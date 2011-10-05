
(function TinycraftIsographPackage(Tinycraft, $, _, undefined){

	Tinycraft.Isograph = function Isograph(options) {
		this._options = {};
		this.blocks = [];
		this.currentFocus = null;
		this.stepSpeed = 0;
		window.dbBlocks = this.dbBlocks = new Minidb();

		this.init = function () {
			var isograph = this;
			this.options(options);

			var throttledMove = _.throttle(move, 10);
			function move(e) {
				var isocoord = isograph.translateToISO(e.pageX, e.pageY);
				var pagecoord = isograph.translateFromISO(isocoord);
				//console.log("block at : ", isocoord.x, isocoord.y);
				var focusedBlock = isograph.dbBlocks.get({
					"coord.x": isocoord.x,
					"coord.y": isocoord.y,
					"coord.z": 0
				});
				if (focusedBlock) {
					isograph.focus(focusedBlock);
				}
			}
			$(window).mousemove(throttledMove);

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.animate = function (block) {
			var $elem, speed, coord;
			speed = this.stepSpeed * 0.8;
			coord = this.translateFromISO(block.coord);
			$elem = $("#" + block.toString());
			this.animateElem($elem, coord.x, coord.y, coord.z, speed);
		};

		this.animateElem = function($elem, x, y, z, speed) {
			var easing = "linear";
			// If the block is lowering his z-index set it first
			// Otherwise set it after
			if ($elem.css("z-index") < z) {
				$elem
						.css({
							"z-index": z
						})
						.animate({
							left: x,
							top: y
						}, speed, easing);
			} else {
				$elem
						.animate({
							left: x,
							top: y
						}, speed, easing, function () {
							$(this)
									.css({
										"z-index": z
									})
						});
			}
		};

		this.focus = function (block) {
			if (this.currentFocus) {
				if (this.currentFocus.toString() === block.toString()) {
					return;
				}
				id = "#" + this.currentFocus.toString();
				$elems = $(id);
				$elems.animate({
					"margin-top": 0
				}, 50);
			}
			var i, id, $elems;
			id = "#" + block.toString();
			$elems = $(id)
					.animate({
						"margin-top": -3
					}, 50);
			this.currentFocus = block;
	//			console.log("$elems: ", $elems, ids);
		};


		this.placeBlocks = function (blocks) {
			var
					i,
					block,
					_blocks = this.blocks;
			for (i in blocks) {
				block = blocks[i];
				_blocks.push(block);
				this.dbBlocks.add(block);
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
		 * Convert pixel position to Isometric coordnates
		 * @param mouseX
		 * @param mouseY
		 */
		this.translateToISO = function (mouseX, mouseY) {
			var _x, _y, x, y, coord, skin;
			skin = options.skin;

			x = mouseX - skin.stageOffsetX - (skin.isoWidth);
	//			y = mouseY - skin.stageOffsetY + (skin.isoBlockHeight);
			y = mouseY - skin.stageOffsetY + 7;

			y = y / (skin.isoTopHeight * 2);
			x = -(x / skin.isoWidth);

			_y = parseInt((2 * y - x) / 2);
			_x = parseInt(x + _y);

			coord = new Tinycraft.Coord(_x, _y, 0);
			return coord;
		};

		this.render = function() {
			var i, block, blocks, $root, $blockElement;
			blocks = this.blocks;
			// todo: get root target from options
			$root = $("#tinycraft");
			$root
					.empty()
					.append("<div class='clickZone' style='width: 100%; height: 100%; z-index: 10000; position: absolute;'></div>");
			for (i in blocks) {
				block = blocks[i];
				$blockElement = this.getElementFromBlock(block);
				$root.append($blockElement);
			}
		};


		this.getElementFromBlock = function (block) {
			var skin, coord, element;
			skin = options.skin;
			coord = this.translateFromISO(block.coord);

			var bgOffsetX = -skin.spritesOffsetX - (block.type.offset * skin.spritesWidth);
			var bgOffsetY = -skin.spritesHeight;
			element = $("<div id='" + block.toString() + "' style='	position: absolute; overflow:  hidden; text-indent: -1000em; width: " + skin.isoSpriteWidth + "px; height: " + skin.isoSpriteHeight + "px; background-image: url(" + skin.spritesURL + "); background-position: " + bgOffsetX + "px " + bgOffsetY + "px; left:" + coord.x + "; top:" + coord.y + "; z-index:" + coord.z + "' class='block'>" + block.type.id + "</div>");
			return element;
		};

		this.init();
	}

})(Tinycraft, jQuery, _);