(function IsomatonRendererPackage(Isomaton, _){

	Isomaton.RenderBlock = function RenderBlock(options) {
		console.log("Rendering block", options);
		var newBlock, topImage;

		newBlock = new Container();

		topImage = new Image();
		topImage.src = options.texture;
		topImage.ready = false;
		topImage.onload = function () {
			textureLoaded(this, function () {
				var topBitmap = new Bitmap(this);
				topBitmap.x = 100;
				topBitmap.y = 100;
				topBitmap.rotation = -45;
				topBitmap.skewX = 15;
				topBitmap.skewY = 15;
				newBlock.addChild(topBitmap);

			}, allDone);
		};

		function allDone () {
			console.log("ALL DONE!");
			options.stage.addChild(newBlock);
		}

		function textureLoaded(image, callback, finalCallback) {
			image.ready = true;
			checkIfDone(finalCallback);
			callback();
		}
		function checkIfDone(finalCallback) {
			if (topImage.ready) {
				finalCallback();
			}
		}


		function ownSpritesheetError () {
			console.error("Isograph: Sprites failed to load: ", this);
		}

	};

})(Isomaton, _);
