import * as d3 from "d3";
import Markers from "./Markers";
import AssetLoader from "./AssetLoader";
import Tooltip from "./Tooltips";

export default class ImageMap {
    constructor(config) {
    const { containerId, imageData, markersData, assets } = config;
      this.containerId = containerId;
      this.imageData = imageData;
      this.markersData = markersData;
      this.toolTipBoundary = 10;
      this.imageLoaded = false;
      this.assets = assets;
      this.loadedState = { image: false, assets: false}


      this.init(config);
    }

    setLoadState = (type, value) => {
      this.loadedState[type] = value;
      const isNotLoad =  Object.values(this.loadedState).some(value => !value);
      if(!isNotLoad){
         this.image.style("opacity", '1');
         this.markers.draw();
      }
    }

    init(config) {
      this.svg = d3
        .select(`#${this.containerId}`)
        .attr(
          "viewBox",
          `0 0 ${this.imageData.width} ${this.imageData.height}`
        )
        .style("cursor", "grab")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .on("pointerup", () => this.svg.style("cursor", "grab"))
        .on('assetsLoaded', () => this.setLoadState("assets", true))
        .on('imageLoaded', () => this.setLoadState("image", true));
          

      this.defs = this.svg.append("defs");
      this.markerGroup = this.svg.append("g");

      this.markerGroup.on("markerClicked", console.log)
    
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

      const { markerGroup, svg, defs, markersData, toolTipBoundary, assets } = this;
      this.tooltipHandler = new Tooltip({ svg, markerGroup, toolTipBoundary })
      this.markers = new Markers({
        markerGroup,
        svg,
        defs,
        markersData,
        toolTipBoundary,
        assets,
        tooltipHandler: this.tooltipHandler,
      });

      this.assetLoader = new AssetLoader({ container: defs, assets, svg })
      
     
      this.handleResize(); // Call handleResize initially
      
    }

    zoomed(event) {
      const { transform } = event;
     
      this.markerGroup.attr("transform", transform);
      this.markers.draw();
      this.markers.moveTooltip(); // move tooltips to track positions of markers
      this.handleCursorResize(event);
    }


    handleCursorResize = (event) => {
      clearTimeout(this.zoomTimeout);
      if (event.sourceEvent && event.sourceEvent.type === "mousemove") {
        this.svg.style("cursor", "grabbing"); // Set cursor to "grabbing" when dragging starts
      } else if (event.sourceEvent && event.sourceEvent.type === "wheel") {
        this.zoomTimeout = setTimeout(
          () => this.svg.style("cursor", "grab"),
          50
        );
        if (event.sourceEvent.deltaY < 0) {
          this.svg.style("cursor", "zoom-in");
        } else {
          this.svg.style("cursor", "zoom-out");
        }
      }
    };

    handleResize = () => {
      const observer = new ResizeObserver((entries) => {
        this.markers.moveTooltip();
      });

      observer.observe(this.svg.node());
    };

    panAndZoom(x, y, zoomLevel) {
      const svgNode = this.svg.node();
      const svgWidth = svgNode.clientWidth;
      const svgHeight = svgNode.clientHeight;
      
      const scaleX = svgWidth / 2 - zoomLevel * x;
      const scaleY = svgHeight / 2 - zoomLevel * y;
      
      this.svg
        .transition()
        .duration(750)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(scaleX, scaleY),
        )
        .transition()
        .duration(100)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(scaleX, scaleY).scale(zoomLevel),
        );
    }
    
  }

