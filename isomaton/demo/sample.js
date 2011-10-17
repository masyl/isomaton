(function ($, _, undefined){
	$(function() {
		var $debug = $("#debug");
		var $time = $debug.find(".time");
		var $speedMultiplier = $debug.find(".speedMultiplier");
		var $playState = $debug.find(".playState");
		var $fps = $debug.find(".sps");

		var isomatonOptions = {
			spritesURL: "../src/worlds/common/isomaton.png",
			spritesOffsetX: 5,
			spritesOffsetY: 0,
			spritesWidth: 60,
			spritesHeight: 60,
/*
			isoWidth: 14,
			isoBlockHeight: 17,
			isoTopHeight: 7,
			isoSpriteWidth: 29,
			isoSpriteHeight: 32,
*/
			isoWidth: 22,
			isoBlockHeight: 24,
			isoTopHeight: 11,
			stageOffsetX: 600,
			stageOffsetY: 0
		};

		isomaton.start({
			world: "common",
			root: "#isomaton",
			stage: "prairie",
			width: 20,
			height: 20,
			skin: isomatonOptions,
			step: function debugStep(stage, world) {
				$time[0].innerHTML = stage.time;
				$speedMultiplier[0].innerHTML = stage.speedMultiplier;
				$playState[0].innerHTML = stage.playState;
				$fps[0].innerHTML = stage.sps.previous;
			}
		});
	});

})(jQuery, _);
