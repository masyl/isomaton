(function IsomatonBlockPackage(Isomaton, $, _, undefined) {


	//todo: move into separate package
	Isomaton.Coord = function Coord(x, y, z, direction) {
		/*
		Directions:
			0: North
			1: East
			2: South
			3: West
			4: Up
			5: Down
		 */
		this.x = x;
		this.y = y;
		this.z = z;
		this.direction = (direction !== undefined) ? direction : 0;

		this.isEqual = function isEqual(coord) {
			var equal = false;
			if (coord) {
				equal = this.x === coord.x && this.y === coord.y && this.z === coord.z;
			}
			return equal;
		};

		this.copy = function copy() {
			return new Isomaton.Coord(this.x, this.y, this.z, this.direction);
		};


		this.serializer = function serializer(json) {
			if (json) {

			} else {

			}
		};

		this.down = function down(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z - offset;
			return this;
		};

		this.up = function up(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.z = this.z + offset;
			return this;
		};

		this.move = function move(direction, _offset) {
			var cardinalDirections;
			cardinalDirections = ["north", "east", "south", "west", "up", "down"];
			return this[cardinalDirections[direction]](_offset);
		};

		// todo: test if cardinal points are adressed correctly
		this.north = function north(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x + offset;
			return this;
		};

		this.east = function east(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y + offset;
			return this;
		};

		this.south = function south(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.x = this.x - offset;
			return this;
		};

		this.west = function west(_offset) {
			var offset = (_offset === undefined) ? 1 : _offset;
			this.y = this.y - offset;
			return this;
		};

		this.stepDistanceFrom = function stepDistanceFrom(coord) {
			var distance = 0;
			if (coord) {
				distance = Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y);
			}
			return distance;
		};

		this.directionsNotAway = function directionsThoward(coord) {
			var directions = [];
			if (coord) {
				if (this.x > coord.x) {
					directions.push(2,2);
				} else if (this.x < coord.x) {
					directions.push(0,0);
				} else {
					directions.push(0, 2);
				}
				if (this.y > coord.y) {
					directions.push(3,3);
				} else if (this.y < coord.y) {
					directions.push(1,1);
				} else {
					directions.push(1, 3);
				}
			}
			return directions;
		};

		this.directionsThoward = function directionsThoward(coord) {
			var directions = [];
			if (coord) {
				if (this.x > coord.x) {
					directions.push(2);
				} else if (this.x < coord.x) {
					directions.push(0);
				}
				if (this.y > coord.y) {
					directions.push(3);
				} else if (this.y < coord.y) {
					directions.push(1);
				}
			}
			return directions;
		};

		this.directionsAway = function directionsAway(coord) {
			var directions = [];
			if (coord) {
				if (this.x > coord.x) {
					directions.push(0);
				} else if (this.x < coord.x) {
					directions.push(2);
				} else {
					directions.push(0, 2);
				}
				if (this.y > coord.y) {
					directions.push(1);
				} else if (this.y < coord.y) {
					directions.push(3);
				} else {
					directions.push(1, 3);
				}
			}
			return directions;
		};

		// todo: function to turn clockwise and anti-clockwise
	};

	Isomaton.Area = function Area(coord, width, height) {
		this.coord = coord;
		this.width = width;
		this.height = height;

		this.randomCoord = function randomCoord(seed) {
			var coord, newCoord, offsetX, offsetY;
			offsetX = Math.round(Isomaton.fakeRandom(seed, "offsetX") * (this.width-1));
			offsetY = Math.round(Isomaton.fakeRandom(seed, "offsetY") * (this.height-1));
			coord = this.coord;
			newCoord = new Isomaton.Coord(coord.x + offsetX, coord.y + offsetY, coord.z);
			return newCoord;
		};

		this.serializer = function serializer(json) {
			if (json) {

			} else {

			}
		};
	}

	
})(Isomaton, jQuery, _);
