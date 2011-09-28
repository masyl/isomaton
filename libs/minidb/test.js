


/**
 * Dog Constructor
 * @param id
 * @param breed
 * @param age
 * @param weight
 */
function Dog (id, breed, age, weight) {
	this.id = id;
	this.breed = breed;
	this.age = age;
	this.weight = weight;

	this.toString = function () {
		return "dog.id" + this.id;
	};

	this.toIndex = function () {
		return {
			id: this.id,
			type: "dog",
			breed: this.breed,
			age: this.age,
			weight: this.weight
		}
	}
}

// Generate and add 100 dogs in the db

var breeds, db, i, dog, query, testDogsRef, testDogs;


breeds = ["small", "medium", "big", "huge", "humongous"];
db = new Minidb();
for (i = 0; i < 2024; i = i + 1) {
	dog = new Dog("dog"+i, breeds[i%3], parseInt(i/4)+1, parseInt(i/8)+6);
	db.add(dog);
}


function testGetLong() {
	dog = db.get({
		age: 5
	});

	db.get({
		weight: 9
	});

	db.get({
		breed: "small"
	});

	db.get({
		age: 8,
		breed: "small"
	});
}

query = {
	weight: 6,
	breed: "small"
};
testDogsRef = db.slowGet(query);

console.time("slow");
for (i = 0; i < (2000); i = i + 1) {
	testDogs = db.slowGet(query);
}
console.timeEnd("slow");

console.time("fast");
for (i = 0; i < (2000); i = i + 1) {
	testDogs = db.get(query);
}
console.timeEnd("fast");

var isSuccess = true;
if (testDogs) {
	if (testDogs.length !== testDogsRef.length) {
		isSuccess = false;
	}
	if (isSuccess) {
		for (i = 0; i < testDogs.length; i = i + 1) {
			if (testDogs[i].toString() !== testDogsRef[i].toString()) {
				isSuccess = false;
			}
		}
	}
} else {
	isSuccess = false;
}

if (isSuccess) {
//	console.info("test is a success!: time difference ratio: ", fast.fast/slow.slow);
	console.info("Success!", testDogsRef, " instead got: ", testDogs);
} else {
	console.error("Test failed: expected: ", testDogsRef, " instead got: ", testDogs);
}
