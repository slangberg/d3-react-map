// import d3 from "d3";
import { zoomTransform, select, easeBounce, easeCubic } from "d3";

export default class Markers {
  constructor({
    markerGroup,
    svg,
    defs,
    markersData,
    toolTipBoundary,
    assets,
    tooltipHandler,
  }) {
    this.markerGroup = markerGroup;
    this.svg = svg;
    this.defs = defs;
    this.markersData = markersData;
    this.toolTipBoundary = toolTipBoundary;
    this.assets = assets;
    this.tooltipHandler = tooltipHandler;
  }

  getMarkerOffset = (assetId, plane) => {
    if (this.assets[assetId] && this.assets[assetId].offset) {
      const { k } = zoomTransform(this.svg.node());
      const index = plane === "x" ? 0 : 1;
      return this.assets[assetId].offset[index] / k;
    }
    return 0;
  };

  getTooltipOffset = (assetId, plane) => {
    if (this.assets[assetId] && this.assets[assetId].toolTipOffset) {
      const index = plane === "x" ? 0 : 1;
      return this.assets[assetId].toolTipOffset[index];
    }
    return 0;
  };

  getMarkerSize = (assetId, prop) => {
    if (this.assets[assetId] && this.assets[assetId][prop]) {
      const { k } = zoomTransform(this.svg.node());
      return this.assets[assetId][prop] / k;
    }
  };

  draw() {
    this.markerGroup
      .selectAll(".marker")
      .data(this.markersData)
      .join("use")
      .attr("class", "marker")
      .attr("id", (d) => `marker-${d.id}`)
      .attr("href", (d) => `#${d.marker}`)
      .attr("width", (d) => this.getMarkerSize(d.marker, "width"))
      .attr("height", (d) => this.getMarkerSize(d.marker, "height"))
      .attr("x", (d) => d.x + this.getMarkerOffset(d.marker, "x"))
      .attr("y", (d) => d.y + this.getMarkerOffset(d.marker, "y"))
      .on("click", (event, d) => this.markerClicked(event, d));
  }

  moveTooltip = () => {
    const getTooltipOffset = this.getTooltipOffset;
    const moveTooltip = this.tooltipHandler.moveTooltip;
    this.markerGroup.selectAll(".marker").each(function (d) {
      const markerNode = select(this).node();
      const markerOffsetX = getTooltipOffset(d.marker, "x");
      const markerOffsetY = getTooltipOffset(d.marker, "y");
      moveTooltip(markerNode, markerOffsetX, markerOffsetY);
    });
  };

  markerClicked(event, d) {
    event.stopPropagation();
    const existingOverlayDiv = select(`#marker-overlay-${d.id}`);
    const marker = select(event.target);

    if (!existingOverlayDiv.node()) {
      const markerNode = marker.node();
      const tooltipOffsetX = this.getTooltipOffset(d.marker, "x");
      const tooltipOffsetY = this.getTooltipOffset(d.marker, "y");
      this.tooltipHandler.drawTooltip(
        markerNode,
        tooltipOffsetX,
        tooltipOffsetY,
        d
      );

      marker
        .transition()
        .duration(200) // Duration for the first segment
        .ease(easeCubic)
        .attr("y", (d) => d.y + this.getMarkerOffset(d.marker, "y") - 10)
        .transition()
        .duration(100) // Duration for the second segment
        .ease(easeCubic)
        .attr("y", (d) => d.y + this.getMarkerOffset(d.marker, "y"));
    } else {
      existingOverlayDiv.remove();
    }
  }
}
