BobTest = TestCase("BobTest");

function Cake() {
	Bobify(this, {
		uid: function() {
			return "cake-" + this.id;
		},
		index: function() {
			return {
				id: this.id,
				weight: this.weight,
				flavor: this.flavor,
				candles: this.candles
			}
		}
	});
	this.set({
		id: 0,
		weight: 20,
		flavor: "chocolate",
		candles: 3
	});
}


BobTest.prototype.testInstantiation = function() {
	var bob = new Bob();
	assertEquals("object", typeof bob);
};


BobTest.prototype.testAdd = function() {
	var bob, cake;
	bob = new Bob();
	cake = new Cake();
	bob.add(cake);
	cake = bob.select({
		weight: 20
	}).get()[0];
	assertEquals(20, cake.weight);
};

