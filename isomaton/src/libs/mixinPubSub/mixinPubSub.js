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
		// Find a better and more usefull output
		// Mabe a "subscription" object ? with a cancel method ?
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

};

