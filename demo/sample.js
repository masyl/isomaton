(function ($, _, undefined){
	$(function() {
		var $debug = $("#debug");
		var $time = $debug.find(".time");

		var tinycraftOptions = {
			spritesURL: "../src/worlds/common/tinycraft.png",
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
			stageOffsetY: 120
		};

		tinycraft.start({
			world: "common",
			root: "#tinycraft",
			stage: "prairie",
			width: 20,
			height: 20,
			skin: tinycraftOptions,
			step: function(stage, world) {
				$time.html(stage.time);
			}
		});
	});

})(jQuery, _);