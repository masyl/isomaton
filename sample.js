(function ($, _, undefined){
	$(function() {
		var $debug = $("#debug");
		var $time = $debug.find(".time");

		var tinycraft2x = {
			spritesURL: "tinycraft-2x.png",
			spritesOffsetX: 10,
			spritesOffsetY: 0,
			spritesWidth: 80,
			spritesHeight: 16,
			isoWidth: 28,
			isoBlockHeight: 34,
			isoTopHeight: 14,
			isoSpriteWidth: 58,
			isoSpriteHeight: 64,
			stageOffsetX: 550,
			stageOffsetY: 200
		};

		var tinycraft1x = {
			spritesURL: "tinycraft.png",
			spritesOffsetX: 5,
			spritesOffsetY: 0,
			spritesWidth: 40,
			spritesHeight: 8,
			isoWidth: 14,
			isoBlockHeight: 17,
			isoTopHeight: 7,
			isoSpriteWidth: 29,
			isoSpriteHeight: 32,
			stageOffsetX: 600,
			stageOffsetY: 100
		};

		tinycraft.start({
			world: "common",
			root: "#tinycraft",
			stage: "prairie",
			width: 24,
			height: 24,
			skin: tinycraft1x,
			step: function(stage, world) {
				$time.html(stage.time);
			}
		});
	});


})(jQuery, _);