(function (undefined) {

	/**
	 * A low level, indexable object registry
	 * Simply pass in an object which supports the toString function
	 * for a unique identifier and a toIndex function to supply the indexed attributes
	 * @param x
	 * @param y
	 * @param z
	 */
	function Minidb() {
		var items, index;
		items = this.items = items = {};
		index = this.index = index = {};

		function keyValuePair(attrs) {
			var key, keys;
			keys = [];
			for (key in attrs) {
				keys.push(key + ":" + attrs[key]);
			}
			return keys;
		}

		// Add an item t
		this.add = function (obj) {
			var item, keys, key;
			key = obj.toString();
			item = new Item(obj);
			items[key] = item;
			keys = keyValuePair(item.attrs);
			addToIndex(obj, keys);
		};

		function addToIndex(obj, keys) {
			var key, indexItem, i;
			for (i in keys) {
				key = keys[i];
				indexItem = index[key];
				if (indexItem === undefined) {
					indexItem = index[key] = {};
				}
				indexItem[obj.toString()] = obj;
			}
			//console.log("addToIndex", obj, keys);
		}

		function removeFromIndex(obj, attrs) {

		}

		// Remove an items
		/*
		this.remove = function (item) {
			var key = item.toString();
			delete items[key];
			// todo: remove all the listed keys
		};
		*/

		// Move an items from one coordinate to another in the matrix
		/*
		this.update = function (item) {
			var key = item.toString();
			delete items[key];
		};
		*/

		// Get which item corresponds to criterias
		this.slowGet = function (attrs) {
			var i, j, attr, item, isMatch, results = [];

			// Iterate through all available items
			for (i in this.items) {
				isMatch = true;
				item = items[i];
				for (j in attrs) {
					attr = attrs[j];
					if (attr !== item.attrs[j]) {
						isMatch = false;
						break;
					}
				}
				if (isMatch) {
					results.push(item.content);
				}
				// Iterate through all attributes to be matched
			}

			return results;
			// get a list of keys and find their interseted attributes

		};


		this.fastGet = function (attrs) {
			var i, j, count, matchedSet, key, subKey, results;
			results = [];
			count = 0;
			matchedSet = {};
			if (attrs) {
				for (i in attrs) {
					key = i + ":" + attrs[i];
					var indexSet = index[key];
					if (!indexSet) {
						return [];
					}
					// Keep the first matched set as the reference set
					// Each sets after that wil be used to exclude non-matches from the reference set
					if (count == 0) {
						if (indexSet) {
							//console.log("match!", matchedSet);
							// copy items from index set to match set (so that we can delete them
							// later without affecting the index
							for (j in indexSet) {
								matchedSet[j] = indexSet[j];
							}
						} else {
							//console.log("no match!");
							return [];
							// No math even for first attribute, return an empty set
						}
					} else {
						//console.log("removing non matching key: ", matchedSet, indexSet);
						for (subKey in matchedSet) {
							if (!indexSet[subKey]) {
								delete matchedSet[subKey];
							}
						}
					}
					count = count + 1;
				}
				//console.log("matched set: ", matchedSet);
				for (key in matchedSet) {
					results.push(matchedSet[key]);
				}
			}
			return results;
		};

		this.get = this.fastGet;
	}

	function Item (obj) {
		this.content = obj;
		this.attrs = obj.toIndex();
		this.keys = {};
	}

	window.Minidb = Minidb;

})();
