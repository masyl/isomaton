(function IsomatonRendererPackage(Isomaton, _){

	Isomaton.RenderBlock = function RenderBlock(options) {
		console.log("Rendering block", options);
		var newBlock, topImage, leftImage, rightImage, stage;

		stage = options.stage;
		newBlock = new Container();

		rightImage = new Image();
		rightImage.src = options.texture;
		rightImage.ready = false;
		rightImage.onload = function () {
			var image = this;

			textureLoaded(this, function () {

				var rightImage = new Bitmap(image);

				newBlock.addChild(rightImage);
				rightImage.x = 110;
				rightImage.y = 160;
//				rightImage.rotate = 45;
//				rightImage.skewX = 15;
//				rightImage.scaleX = 1;
				rightImage.skewY = 25;


			}, allDone);
		};

		topImage = new Image();
		topImage.src = options.texture;
		topImage.ready = false;
		topImage.onload = function () {
			var image = this;

			textureLoaded(this, function () {

				var topBitmap = new Bitmap(image);

				newBlock.addChild(topBitmap);
				topBitmap.x = 260;
				topBitmap.y = 10;

				// Problem here... skewing and rotation together dont behave as a CSS transform
				// or as photoshop would...
				topBitmap.skewX = 25;
				topBitmap.skewY = 25;
				topBitmap.rotation = -45;

				topBitmap.regX = topBitmap.width / 2;
				topBitmap.regY = topBitmap.height / 2;

				console.log(topBitmap, topBitmap.getConcatenatedMatrix());

			}, allDone);
		};

		leftImage = new Image();
		leftImage.src = options.texture;
		leftImage.ready = false;
		leftImage.onload = function () {
			var image = this;

			textureLoaded(this, function () {

				var leftImage = new Bitmap(image);

				newBlock.addChild(leftImage);
				leftImage.x = 110 + 112;
				leftImage.y = 160 + 52;
//				leftImage.rotate = 45;
//				leftImage.skewX = 15;
//				leftImage.scaleX = 1;
				leftImage.skewY = -25;


			}, allDone);
		};


		function allDone () {
			console.log("ALL DONE!", stage, newBlock);
			stage.addChild(newBlock);

		}

		function textureLoaded(image, callback, finalCallback) {
			console.log("texture loaded");
			image.ready = true;
			checkIfDone(finalCallback);
			callback();
		}
		function checkIfDone(finalCallback) {
			if (topImage.ready && rightImage.ready && leftImage.ready) {
				finalCallback();
			}
		}


		function ownSpritesheetError () {
			console.error("Isograph: Sprites failed to load: ", this);
		}

	};

})(Isomaton, _);
