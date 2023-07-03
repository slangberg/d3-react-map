import { dispatch } from "d3";

/**
 * The API Event Dispatcher for the ImageMap allows for simple event dispatching and listeners to exist outside of ImageMap
 */
export default class EventDispatcher {
  constructor() {
    this.events = [
      "onImageLoad",
      "onAssetLoad",
      "onLoad",
      "onMarkerClick",
      "onPanZoom",
      "onTooltipShow",
      "onTooltipHide",
    ];

    this.actions = [
      "zoomToMarker",
      "zoomToContainElement",
      "zoomToPosition",
      "centerMap",
      "removeTooltip",
      "showTooltip",
    ];

    this.eventTypes = [...this.events, ...this.actions];

    this.listeners = {};

    this.dispatcher = dispatch(...this.eventTypes);
    this.buildApiMethods();
  }

  /**
   * Build API methods for each of the Event Dispatcher's events and actions.
   */
  buildApiMethods = () => {
    this.actions.forEach((methodName) => {
      this[methodName] = (data) => this.dispatch(methodName, data);
    });

    this.events.forEach((methodName) => {
      this[methodName] = (callback) => this.register(methodName, callback);
    });
  };

  /**
   * Register a group of listeners for the Event Dispatcher based of a dictatory object
   * @param {Object} listenerDictionary - The dictionary of listeners.
   */
  registerListeners = (listenerDictionary) => {
    Object.entries(listenerDictionary).forEach(([id, callback]) => {
      this.register(id, callback);
    });
  };

  /**
   * Register a callback for a specific event type.
   * @param {string} eventType - The type of the event.
   * @param {Function} callback - The callback function.
   */
  register = (eventType, callback) => {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
    this.dispatcher.on(eventType, (...args) =>
      this.listeners[eventType].forEach((callback) => callback(...args))
    );
  };

  /**
   * Dispatch an event.
   * @param {string} eventType - The type of the event.
   * @param {Object} data - The data to be passed to the event.
   */
  dispatch = (eventType, data) => {
    if (this.eventTypes.includes(eventType)) {
      this.dispatcher.call(eventType, null, data);
    } else {
      console.error(`${eventType} is not a valid event`);
    }
  };
}
