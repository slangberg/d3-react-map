import { zoomTransform, select, easeBounce, easeCubic } from "d3";
export default class Tooltip {
  constructor({ svg, toolTipBoundary, markerGroup }) {
    this.svg = svg;
    this.tooltipObservers = {};
    this.toolTipBoundary = toolTipBoundary;
    this.markerGroup = markerGroup;
  }

  moveTooltip = (markerNode, tooltipOffsetX, tooltipOffsetY, markerData) => {
    // Get the SVG container dimensions
    const svgContainerBounds = this.svg.node().getBoundingClientRect();
    const padding = this.toolTipBoundary;
    const markerClientRect = markerNode.getBoundingClientRect();
    const overlayDiv = select(`#marker-overlay-${markerData.id}`);
    const overlayNode = overlayDiv.node();
    const outsideFrame =
      markerClientRect.right < svgContainerBounds.left + padding ||
      markerClientRect.left > svgContainerBounds.right - padding ||
      markerClientRect.bottom < svgContainerBounds.top + padding ||
      markerClientRect.top > svgContainerBounds.bottom - padding;

    if (overlayDiv && overlayNode && !outsideFrame) {
        const topOffset = markerClientRect.top + tooltipOffsetY;
        const leftOffset =
          markerClientRect.left + markerClientRect.width / 2 + tooltipOffsetX;

      overlayDiv
        .style("position", "absolute")
        .style("top", `${topOffset}px`)
        .style("left", `${leftOffset}px`);

        this.translateContent(overlayDiv.select('.marker-content'))
    }

    ;

    if (overlayDiv && outsideFrame) {
      overlayDiv.remove();
    }
  };

  drawTooltip = (markerNode, tooltipOffsetX, tooltipOffsetY, markerData) => {
    const markerClientRect = markerNode.getBoundingClientRect();
    const overlayDiv = select("body")
      .append("div")
      .attr("class", "marker-overlay tip-down")
      .attr("id", `marker-overlay-${markerData.id}`);

   

    const content = overlayDiv
      .append("div")
      .attr("class", "marker-content")
      .attr("id", `marker-overlay-${markerData.id}-content`);

    overlayDiv.append("div").attr("class", "marker-tip")
    overlayDiv.append("div").attr("class", "marker-tip-shadow");

    content.append("div").attr("class", "marker-stuff").text(markerData.name);

    const topOffset = markerClientRect.top + tooltipOffsetY;
    const leftOffset =
      markerClientRect.left + markerClientRect.width / 2 + tooltipOffsetX;

    overlayDiv
      .style("top", `${topOffset}px`)
      .style("left", `${leftOffset}px`)
      .style("opacity", "1");

    const boxRect = content.node().getBoundingClientRect();
    const adjustedLeft = boxRect.width / 2;
    content.style("left", `${-adjustedLeft}px`);

    this.translateContent(content);
  };

  translateContent = (contentNode) => {
    const boxAfterMove = contentNode.node().getBoundingClientRect();
    var isOffScreen =
      boxAfterMove.left < 0 ||
      boxAfterMove.right > window.innerWidth ||
      boxAfterMove.top < 0 ||
      boxAfterMove.bottom > window.innerHeight;

    // // Apply CSS transforms if the div is off-screen
    if (isOffScreen) {
      var translateX = 0;
      var translateY = 0;

      if (boxAfterMove.left < 0) {
        translateX = -boxAfterMove.left + 10;
      } else if (boxAfterMove.right > window.innerWidth) {
        translateX =
          window.innerWidth - boxAfterMove.right + boxAfterMove.width / 2 - 10;
      }

      if (boxAfterMove.top < 0) {
        translateY = -boxAfterMove.top + 10;
      } else if (boxAfterMove.bottom > window.innerHeight) {
        translateY = window.innerHeight - boxAfterMove.bottom - 10;
      }
      contentNode.style(
        "transform",
        "translate(" + translateX + "px, " + translateY + "px)"
      );
    } else {
        contentNode.style(
            "transform",
            undefined
        );
    }
  };
}
