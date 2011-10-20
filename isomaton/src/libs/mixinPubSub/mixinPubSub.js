(function (global) {

	/**
	 * Add publish and subscribe capabilities to an object
	 * Mathieu Sylvain 2011
	 */

	function PubSub() {
		this.subscribers = {};
		this.publish = publish;
		this.subscribe = subscribe;
		this.unsubscribe = unsubscribe;
	}

	global.PubSub = PubSub;
	global.mixinPubSub = function mixinPubSub(obj) {
		return PubSub.call(obj);
	};

	function publish(topic, args) {
		var subscriber, topicSubscribers, i;
		topicSubscribers = this.subscribers[topic];
		if (topicSubscribers) {
			for (i = 0; i < topicSubscribers.length; i = i + 1) {
				subscriber = topicSubscribers[i];
				subscriber.apply(this, args || []);
			}
		}
	}

	function subscribe(topic, callback) {
		if (!this.subscribers[topic]) {
			this.subscribers[topic] = [];
		}
		this.subscribers[topic].push(callback);
		// todo: DONT USE HANDLE PAIR FOR RETURN VALUE AND UNSUBSCRIBE
		// Find a better and more usefull output
		// Mabe a "subscription" object ? with a cancel method ?
		return [topic, callback];
	}

	function unsubscribe(handle) {
		var
			i,
			subscriber,
			topicSubscribers,
			topic = handle[0];
		topicSubscribers = this.subscribers[topic];
		if (topicSubscribers) {
			for (i = 0; i < topicSubscribers.length; i = i + 1) {
				subscriber = topicSubscribers[i];
				if (subscriber === handle[1]) {
					topicSubscribers.splice(i, 1);
				}
			}
		}
		return this;
	}

})(this);
