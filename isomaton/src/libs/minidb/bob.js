(function (undefined) {

	/**
	 * A low level, indexable object registry
	 * Simply pass in an object which supports the toString function
	 * for a unique identifier and a toIndex function to supply the indexed attributes
	 */
	function Bob() {
		var selection, items, index;
		items = this.items = items = {};
		index = this.index = index = {};

		mixinPubSub(this);

		selection = [];

		// Add an item
		this.add = function (input, silentEvent) {
			var i, item, keys, key, obj, objs, indexKeys;
			// Convert the input to an array of items, or take the current selection
			if (input !== undefined) {
				if (input.constructor.name === "Array") {
					objs = input;
				} else {
					objs = [input];
				}
				for (i = 0; i < objs.length; i = i + 1) {
					obj = objs[i];
					indexKeys = obj.index();
					key = indexKeys.uid;
					item = new Item(obj, indexKeys);
					items[key] = item;
					addToIndex(obj, item.keys);
				}
			}
			selection = objs;
			if (!silentEvent && objs.length) this.publish("add", [objs]);
			return this;
		};

		this.set = function set(attrs) {
			var i, item, attrId;
			for (i in selection) {
				item = selection[item];
				item.set(attrs);
			}
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

		// Add an objects keys into the index
		function addToIndex(obj, indexKeys) {
			var key, indexItem, i;
			for (i in indexKeys) {
				key = indexKeys[i];
				indexItem = index[key];
				if (indexItem === undefined) {
					indexItem = index[key] = {};
				}
				indexItem[obj.index().uid] = obj;
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
				objKey = obj.index().uid;
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
				removed.push(obj);
			}
			if (!silentEvent && removed.length) this.publish("remove", [removed]);
			return this;
		};

		this.update = function update(input, silentEvent) {
			//console.log("update:", input);
			// todo: find a better way of updating than just a remove followed by an add
			this.remove(input, true);
			this.add(input, true);
			if (!silentEvent && selection.length) this.publish("update", [selection]);
		};

		// todo: this is unused... should be used in ".remove()"
		function removeFromIndex(obj, indexKeys) {
			var key, indexItem, i;
			for (i in indexKeys) {
				key = indexKeys[i];
				indexItem = index[key];
				if (indexItem !== undefined) {
					delete indexItem[obj.index().uid];
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

	function keyValuePairs(index) {
		var key, keys;
		keys = [];
		for (key in index) {
			keys.push(key + ":" + index[key]);
		}
		return keys;
	}

	function Item (obj, indexKeys) {
		this.content = obj;
		this.index = indexKeys;
		this.keys = keyValuePairs(indexKeys);
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

	function Bobify(obj, options) {
		obj.set = function set(attrs) {
			var attrId;
			for (attrId in attrs) {
				if (attrs.hasOwnProperty(attrId)) {
					this[attrId] = attrs[attrId];
				}
			}
		};
		obj.index = options.index;
	}

	window.Bob = Bob;
	window.Bobify = Bobify;

})();
