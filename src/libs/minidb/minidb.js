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
		var selection, items, index;
		items = this.items = items = {};
		index = this.index = index = {};

		selection = [];

		mixinPubSub(this);

		// Add an item
		this.add = function (input, silentEvent) {
			var i, item, keys, key, obj, objs;
			// Convert the input to an array of items, or take the current selection
			if (input !== undefined) {
				if (input.constructor.name === "Array") {
					objs = input;
				} else {
					objs = [input];
				}
				for (i = 0; i < objs.length; i = i + 1) {
					obj = objs[i];
					key = obj.toString();
					item = new Item(obj);
					items[key] = item;
					addToIndex(obj, item.keys);
				}
			}
			selection = objs;
			if (!silentEvent && objs.length) this.publish("add", [objs]);
			return this;
		};

		this.all = function all() {
			var i;
			selection = [];
			for (i in this.items) {
				selection.push(this.items[i].content);
			}
			return this;
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
		}

		// todo: reduce cyclomatic complexity of this method
		this.remove = function remove(input, silentEvent) {
			var i, j, item, indexItem, keys, key, obj, objKey, objs, removed = [];
			// Convert the input to an array of items, or take the current selection
			if (input === undefined) {
				objs = selection;
			} else {
				if (input.constructor.name === "Array") {
					objs = input;
				} else {
					objs = [input];
				}
				selection = objs;
			}
			for (i = 0; i < objs.length; i = i + 1) {
				obj = objs[i];
				// Find the item to delete
				objKey = obj.toString();
				item = items[objKey];
				keys = item.keys;
				// Iterate through all the referenced and remove the item from each of them
				for (j = 0; j < keys.length; j = j + 1) {
					key = keys[j];
					indexItem = index[key];
					if (indexItem) {
						delete indexItem[objKey];
					}
				}

				// Add the removed item to the output
				removed.push(objs);
			}
			if (!silentEvent && removed.length) this.publish("remove", [removed]);
			return this;
		};

		this.update = function update(input, silentEvent) {
			this.remove(input, true);
			this.add(input, true);
			if (!silentEvent && selection.length) this.publish("update", [selection]);
		};

		function removeFromIndex(obj, keys) {
			var key, indexItem, i;
			for (i in keys) {
				key = keys[i];
				indexItem = index[key];
				if (indexItem !== undefined) {
					delete indexItem[obj.toString()];
				}
			}
		}

		this.get = function (criterias) {
			var i, j, count, matchedSet, key, subKey, results;
			results = [];
			count = 0;
			matchedSet = {};
			if (criterias) {
				for (i in criterias) {
					key = i + ":" + criterias[i];
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
			} else {
				results = selection;
			}
			return results;
		};

		this.select = function select(criterias) {
			selection = this.get(criterias);
			return this;
		};

		this.clear = function clear() {
			selection = [];
			return this;
		};

	}

	function keyValuePairs(attrs) {
		var key, keys;
		keys = [];
		for (key in attrs) {
			keys.push(key + ":" + attrs[key]);
		}
		return keys;
	}

	function Item (obj) {
		this.content = obj;
		this.attrs = obj.toIndex();
		this.keys = keyValuePairs(this.attrs);
	}

	/**
	 * Add publish and subscribe capabilities to an object or prototype
	 * Mathieu Sylvain 2011
	 * @param obj
	 */
	function mixinPubSub(obj) {
		obj.subscribers = {};
		obj.publish = function(topic, args){
			var subscriber, topicSubscribers, i;
			topicSubscribers = this.subscribers[topic];
			if (topicSubscribers) {
				for (i = 0; i < topicSubscribers.length; i = i + 1) {
					subscriber = topicSubscribers[i];
					subscriber.apply(this, args || []);
				}
			}
		};
		obj.subscribe = function(topic, callback){
			if(!this.subscribers[topic]){
				this.subscribers[topic] = [];
			}
			this.subscribers[topic].push(callback);
			// todo: DONT USE HANDLE PAIR FOR RETURN VALUE AND UNSUBSCRIBE
			return [topic, callback];
		};
		obj.unsubscribe = function(handle){
			var subscriber, topicSubscribers, i;
			var topic = handle[0];
			topicSubscribers = this.subscribers[topic];
			if (topicSubscribers) {
				for (i = 0; i < topicSubscribers.length; i = i + 1) {
					subscriber = topicSubscribers[i];
					if(subscriber === handle[1]){
						topicSubscribers.splice(i, 1);
					}
				}
			}
			return this;
		};

	}


	window.Minidb = Minidb;

})();
