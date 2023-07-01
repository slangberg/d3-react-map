import { dispatch } from "d3";

export default class EventDispatcher {
  constructor() {
    this.events = [
      "onImageLoad",
      "onAssetLoad",
      "onLoad",
      "onMarkerClick",
      "onPanZoom",
    ];

    this.actions = ["zoomToMarker", "zoomToContainElement", "zoomToPosition", "centerMap"];

    this.eventTypes = [...this.events, ...this.actions];

    this.listeners = {};

    this.dispatcher = dispatch(...this.eventTypes);
    this.buildApiMethods();
  }

  buildApiMethods = () => {
    this.actions.forEach((methodName) => {
      this[methodName] = (data) => this.dispatch(methodName, data);
    });
  };

  registerListeners = (listenerDictionary) => {
    Object.entries(listenerDictionary).forEach(([id, callback]) => {
      this.register(id, callback);
    });
  };

  register = (eventType, callback) => {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
    this.dispatcher.on(eventType, (...args) =>
      this.listeners[eventType].forEach((callback) => callback(...args))
    );
  };

  dispatch = (eventType, data) => {
    if (this.eventTypes.includes(eventType)) {
      this.dispatcher.call(eventType, null, data);
    } else {
      console.error(`${eventType} is not a valid event`);
    }
  };
}
