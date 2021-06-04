var EventBridge = {
    eventList: {},
    on: (eventKey, callback) => {
        if (typeof eventKey === 'string' && typeof callback === 'function') {
            EventBridge.eventList[eventKey] = callback;
        }
        return this;
    },
    trigger: (eventKey, ...arguments) => {
        if (EventBridge.eventList[eventKey]) {
            EventBridge.eventList[eventKey].apply(this, arguments);
        }
    }
}
window.EventBridge = EventBridge;