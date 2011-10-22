(function () {

	/**
	 * A low level, indexable object registry
	 * Simply pass in an object which supports the toString function
	 * for a unique identifier and a toIndex function to supply the indexed attributes
	 */
	function Bob() {
		var bob, items, index;
		items = this.items = {};
		index = this.index = {};

		bob = this;

		mixinPubSub(this);

		function buildSelection(objs) {
			var ret = extend(objs, bob);
			return ret;
		}

		function extend (obj) {
			var prop, arg, source;
			for (arg = 1; arg < arguments.length; arg = arg + 1) {
				source = arguments[arg];
				for (prop in source) {
					if (source.hasOwnProperty(prop)) {
						if (source[prop] !== void 0) obj[prop] = source[prop];
					}
				}
			}
			return obj;
		}


		// Add an item
		this.add = function (input, silentEvent) {
			var i, item, keys, key, obj, objs, indexKeys;
			// Convert the input to an array of items, or take the current selection
			if (input !== void 0) {
				if (input.constructor.name === "Array") {
					objs = input;
				} else {
					objs = [input];
				}
				for (i = 0; i < objs.length; i = i + 1) {
					obj = objs[i];
					if (obj.bob) {
						// Subscribe to the objects "set" published event
						if (!silentEvent) {
							// todo: unsubscribe on remove
							obj.bob.subscribe("set", onObjectUpdate);
							obj.bob.subscribe("update", onObjectUpdate);
						}
						indexKeys = obj.bob.index.call(obj);
						key = indexKeys.uid;
						item = new Item(obj, indexKeys);
						items[key] = item;
						addToIndex(obj, item.keys);
					} else {
						console.error("this object doesnt support Bob! Bobify it first!", obj);
					}
				}
			}
			if (!silentEvent && objs.length) this.publish("add", [objs]);
			return this;
		};

		function onObjectUpdate (attrs) {
			bob.update([this.obj], false, attrs);
		}

		this.set = function set(attrs) {
			var i, item, attrId;
			if (this.length !== void 0) {
				for (i = 0; i < this.length; i = i + 1) {
					item = this[i];
					item.set(attrs);
				}
			}
			return this;
		};

		this.all = function all() {
			return buildSelection(this.items);
		};

		// Add an objects keys into the index
		function addToIndex(obj, indexKeys) {
			var key, indexItem, i;
			for (i in indexKeys) {
				key = indexKeys[i];
				indexItem = index[key];
				if (indexItem === void 0) {
					indexItem = index[key] = {};
				}
				indexItem[obj.bob.index.call(obj).uid] = obj;
			}
		}

		/**
		 * Remove a collection of objects from the index
		 * @param input
		 * @param silentEvent
		 */
		this.remove = function remove(input, silentEvent) {
			var i, key, obj, objs, removed = [];
			// Convert the input to an array of items, or take the current selection
			if (input === void 0) {
				if (this.length !== void 0) {
					objs = this; // If the current object is a selection
				}
			} else {
				if (input.constructor.name === "Array") {
					objs = input;
				} else {
					objs = [input];
				}
			}

			for (i = 0; i < objs.length; i = i + 1) {
				obj = objs[i];
				removeFromIndex(obj);
				// Add the removed item to the output
				removed.push(obj);
			}
			if (!silentEvent && removed.length) this.publish("remove", [removed]);
			return buildSelection(objs);
		};

		/**
		 * Remove one object from the index
		 * @param obj
		 */
		function removeFromIndex(obj) {
			var objKey, item, keys, j, key, indexItem;
			// Find the item to delete
			objKey = obj.bob.index.call(obj).uid;
			item = items[objKey];
			keys = item.keys;
			// Iterate through all the keys and remove the item from each of them
			for (j = 0; j < keys.length; j = j + 1) {
				key = keys[j];
				indexItem = index[key];
				if (indexItem) {
					delete indexItem[objKey];
				}
			}
			return obj;
		}


		this.update = function update(input, silentEvent, attrs) {
			// todo: find a better way of updating than just a remove followed by an add
			// todo: the update should be able to only change the part of the index that have changed
			// todo: this should be done by passing an attrs param to this update method
			this.remove(input, true);
			this.add(input, true);
			if (!silentEvent && input.length) this.publish("update", [input]);
		};

		this.get = function (criterias) {
			var i, j, count, matchedSet, key, subKey, results, indexSet;
			results = [];
			count = 0;
			matchedSet = {};
			if (criterias) {
				for (i in criterias) {
					key = i + ":" + criterias[i];
					indexSet = index[key];
					if (!indexSet) {
						return [];
					}
					// Keep the first matched set as the reference set
					// Each sets after that wil be used to exclude non-matches from the reference set
					if (count === 0) {
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
				results = this;
			}
			return results;
		};

		this.find = function find(criterias) {
			return buildSelection(
				this.get(criterias)
			);
		};

		this.clear = function clear() {
			return buildSelection([]);
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
		// Add the bob connector to this object
		obj.bob = {
			obj: obj,
			update: function update() {
				obj.bob.publish("update");
			},
			// Add the index handler to the Bob connector
			index: options.index
		};
		// Make the bob connector a PubSub
		mixinPubSub(obj.bob);

		// Add the .set() method to the object itself
		obj.set = function set(attrs) {
			var attrId;
			for (attrId in attrs) {
				if (attrs.hasOwnProperty(attrId)) {
					this[attrId] = attrs[attrId];
				}
			}
			obj.bob.publish("set", [attrs]);
		};
	}

	window.Bob = Bob;
	window.Bobify = Bobify;

})();
