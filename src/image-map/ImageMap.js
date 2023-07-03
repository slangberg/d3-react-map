import * as d3 from "d3";
import Markers from "./Markers";
import AssetLoader from "./AssetLoader";
import Tooltip from "./Tooltips";
import EventDispatcher from "./EventDispatcher";

/**
 * The base image map class used to generate can
 */
export default class ImageMap {
  /**
   * Create an Image Map.
   * @param {Object} config - The configuration object.
   * @param {string} config.containerId - The ID of the container element.
   * @param {Object} config.imageData - The image data object.
   * @param {Array} config.markersData - The markers data array.
   * @param {Array} config.assets - The assets array.
   * @param {boolean} config.multiSelectionMode - The multi-selection mode flag.
   */
  constructor(config) {
    const { containerId, imageData, markersData, assets, multiSelectionMode } =
      config;
    this.containerId = containerId;
    this.imageData = imageData;
    this.markersData = markersData;
    this.toolTipBoundary = 10;
    this.imageLoaded = false;
    this.assets = assets;
    this.loadedState = { image: false, assets: false };
    this.eventDispatcher = new EventDispatcher();
    this.multiSelection = multiSelectionMode;

    this.init();
  }

  /**
   * Set the load state of various process such as assets, image load.
   * @param {string} type - The type of the load state.
   * @param {boolean} value - The value of the load state.
   */
  setLoadState = (type, value) => {
    this.loadedState[type] = value;
    const isNotLoad = Object.values(this.loadedState).some((value) => !value);
    if (!isNotLoad) {
      this.image.style("opacity", "1");
      this.markers.draw();
    }
  };

  /**
   * Initialize the map and draws the markers
   */
  init() {
    this.svg = d3
      .select(`#${this.containerId}`)
      .attr("viewBox", `0 0 ${this.imageData.width} ${this.imageData.height}`)
      .style("cursor", "grab")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("pointerup", () => this.svg.style("cursor", "grab"))
      .on("assetsLoaded", () => this.setLoadState("assets", true))
      .on("imageLoaded", () => this.setLoadState("image", true));

    this.defs = this.svg.append("defs");
    this.markerGroup = this.svg.append("g");

    this.markerGroup.on("markerClicked", console.log);

    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 4])
      .on("zoom", (event) => this.zoomed(event));

    this.svg.call(this.zoom);

    this.image = this.markerGroup
      .append("image")
      .attr("id", "mapImage")
      .attr("href", this.imageData.path)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("opacity", "0")
      .on("load", () => this.setLoadState("image", true));

    const {
      markerGroup,
      svg,
      defs,
      markersData,
      toolTipBoundary,
      assets,
      multiSelection,
      eventDispatcher,
    } = this;

    this.tooltipHandler = new Tooltip({
      svg,
      markerGroup,
      toolTipBoundary,
      multiSelection,
      eventDispatcher,
    });

    this.markers = new Markers({
      markerGroup,
      svg,
      defs,
      markersData,
      toolTipBoundary,
      assets,
      tooltipHandler: this.tooltipHandler,
      eventDispatcher: this.eventDispatcher,
    });

    this.assetLoader = new AssetLoader({ container: defs, assets, svg });

    this.eventDispatcher.registerListeners({
      zoomToPosition: (config) => this.panAndZoom(config),
      zoomToMarker: (id) => this.zoomToMarker(id),
      centerMap: () => this.centerMap(),
      zoomToContainElement: (id) => this.zoomToContainElement(id),
      removeTooltip: (id) => this.tooltipHandler.removeTooltip(id),
      showTooltip: (id) => this.markers.showTooltip(id),
      onMarkerClick: ({ id }) => this.zoomToMarker(id),
    });

    this.handleResize(); // Call handleResize initially
  }

  /**
   * Get the event API.
   * @returns {EventDispatcher} The event dispatcher.
   */
  getEventApi = () => {
    return this.eventDispatcher;
  };

  /**
   * Handle native D3 pan and zoom event.
   * @param {Object} event - The event object.
   */
  zoomed(event) {
    const { transform } = event;

    this.markerGroup.attr("transform", transform);
    this.markers.draw();
    this.markers.moveTooltip(); // move tooltips to track positions of markers
    this.handleCursorResize(event);
  }

  /**
   * Set what the mouse cursor will be based on the zoom and pan event.
   * @param {Object} event - The event object.
   */
  handleCursorChange = (event) => {
    clearTimeout(this.zoomTimeout);
    if (event.sourceEvent && event.sourceEvent.type === "mousemove") {
      this.svg.style("cursor", "grabbing"); // Set cursor to "grabbing" when dragging starts
    } else if (event.sourceEvent && event.sourceEvent.type === "wheel") {
      this.zoomTimeout = setTimeout(() => this.svg.style("cursor", "grab"), 50);
      if (event.sourceEvent.deltaY < 0) {
        this.svg.style("cursor", "zoom-in");
      } else {
        this.svg.style("cursor", "zoom-out");
      }
    }
  };

  /**
   * Handles rerendering based on the SVG resize event
   */
  handleResize = () => {
    const observer = new ResizeObserver((entries) => {
      this.markers.moveTooltip();
    });

    observer.observe(this.svg.node());
  };

  /**
   * Pan and zoom to a specific position.
   * @param {Object} config - The configuration object.
   * @param {number} config.x - The x-coordinate.
   * @param {number} config.y - The y-coordinate.
   * @param {number} config.zoomLevel - The zoom level.
   */
  panAndZoom({ x, y, zoomLevel }) {
    const svgNode = this.svg.node();
    const svgWidth = svgNode.clientWidth;
    const svgHeight = svgNode.clientHeight;

    const scaleX = svgWidth / 2 - zoomLevel * x;
    const scaleY = svgHeight / 2 - zoomLevel * y;

    this.svg
      .transition()
      .duration(500)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(scaleX, scaleY).scale(zoomLevel)
      );
  }

  /**
   * Zoom to a specific marker.
   * @param {string} id - The ID of the marker.
   */
  zoomToMarker = (id) => {
    const data = this.markers.getMarkerData(id);
    if (data) {
      const { x, y } = data;
      this.panAndZoom({ x, y, zoomLevel: 3 });
    }
  };

  /**
   * Zoom to contain a specific element.
   * @param {string} id - The ID of the element.
   */
  zoomToContainElement = (id) => {
    const data = this.markers.getMarkerData(id);
    const svg = this.svg;

    if (data) {
      const { node, x, y } = data;
      var bbox = node.getBoundingClientRect();

      // Get the dimensions of the SVG viewport
      var width = svg.node().clientWidth;
      var height = svg.node().clientHeight;

      // Calculate the scale
      var scaleX = width / bbox.width;
      var scaleY = height / bbox.height;
      var scale = Math.min(scaleX, scaleY); // Ensure the element fits both dimensions

      this.panAndZoom({ x, y, zoomLevel: scale });
    }
  };

  /**
   * Center the map.
   */
  centerMap = () => {
    this.svg
      .transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };
}
