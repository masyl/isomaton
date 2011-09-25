jQuery(function() {
	tinycraft.start({
		world: "common",
		root: "#tinycraft",
		stage: "prairie"
	});
	$(".block").live("mouseover", function () {
		$(this).animate({
			"margin-top": -16
		}, 100);
	});
	$(".block").live("mouseout", function () {
		$(this).animate({
			"margin-top": 0
		}, 300);
	});
});
