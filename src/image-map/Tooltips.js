import { select, selectAll } from "d3";
/**
 * A class to draw and position tooltips in the DOM over markers.
 */
export default class Tooltip {
  /**
   * Constructs a new Tooltip instance.
   * @param {object} options - The options for the Tooltip.
   * @param {HTMLElement} options.svg - The SVG container element.
   * @param {number} options.toolTipBoundary - The boundary size for the tooltip.
   * @param {HTMLElement} options.markerGroup - The marker group element.
   * @param {EventDispatcher} options.eventDispatcher - The event dispatcher.
   * @param {boolean} options.multiSelection - Indicates whether multi-selection is enabled.
   */
  constructor({
    svg,
    toolTipBoundary,
    markerGroup,
    eventDispatcher,
    multiSelection,
  }) {
    this.svg = svg;
    this.tooltipObservers = {};
    this.toolTipBoundary = toolTipBoundary;
    this.markerGroup = markerGroup;
    this.events = eventDispatcher;
    this.multiSelection = multiSelection;
  }

  /**
   * Moves the tooltip to a new position based on the marker node and offset values.
   * @param {HTMLElement} markerNode - The marker node.
   * @param {number} tooltipOffsetX - The X offset for the tooltip.
   * @param {number} tooltipOffsetY - The Y offset for the tooltip.
   * @param {object} markerData - The data associated with the marker.
   */
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
      const topOffset = markerClientRect.top + tooltipOffsetY / 2;
      const leftOffset =
        markerClientRect.left + markerClientRect.width / 2 + tooltipOffsetX;

      overlayDiv
        .style("position", "absolute")
        .style("top", `${topOffset}px`)
        .style("left", `${leftOffset}px`);

      this.translateContent(overlayDiv.select(".marker-content"));
    }

    if (overlayDiv && outsideFrame) {
      overlayDiv.remove();
    }
  };

  /**
   * Removes any existing tooltips from the marker overlays.
   */
  removeExistingTooltips = () => {
    const _remove = this.removeTooltip;
    selectAll(".marker-overlay").each(function (d, i) {
      _remove(d.id);
    });
  };

  /**
   * Removes a tooltip with the specified ID.
   * @param {string} id - The ID of the tooltip to remove.
   */
  removeTooltip = (id) => {
    const existing = select(`#marker-overlay-${id}`);
    if (existing.node()) {
      const content = existing.select(".marker-content");
      const data = existing.datum();
      this.events.dispatch("onTooltipHide", {
        data: data,
        contentNode: content.node(),
        contentId: `#marker-overlay-${data.id}-content`,
        contentClass: ".marker-content",
      });
      existing.remove();
    } else {
      console.error("Not matching tooltip open");
    }
  };

  /**
   * Draws a new tooltip for the specified marker.
   * @param {HTMLElement} markerNode - The marker node.
   * @param {number} tooltipOffsetX - The X offset for the tooltip.
   * @param {number} tooltipOffsetY - The Y offset for the tooltip.
   * @param {object} markerData - The data associated with the marker.
   */
  drawTooltip = (markerNode, tooltipOffsetX, tooltipOffsetY, markerData) => {
    if (!this.multiSelection) {
      this.removeExistingTooltips();
    }

    const markerClientRect = markerNode.getBoundingClientRect();
    const overlayDiv = select("body")
      .append("div")
      .attr("class", "marker-overlay tip-down")
      .attr("id", `marker-overlay-${markerData.id}`);

    const content = overlayDiv
      .append("div")
      .attr("class", "marker-content")
      .attr("id", `marker-overlay-${markerData.id}-content`)
      .html(markerData.name);

    overlayDiv.append("div").attr("class", "marker-tip");
    overlayDiv.append("div").attr("class", "marker-tip-shadow");

    const topOffset = markerClientRect.top + tooltipOffsetY;
    const leftOffset =
      markerClientRect.left + markerClientRect.width / 2 + tooltipOffsetX;

    overlayDiv
      .style("top", `${topOffset}px`)
      .style("left", `${leftOffset}px`)
      .style("opacity", "1")
      .datum(markerData);

    this.events.dispatch("onTooltipShow", {
      data: markerData,
      contentNode: content.node(),
      position: { top: topOffset, left: leftOffset },
      contentId: `#marker-overlay-${markerData.id}-content`,
      contentClass: ".marker-content",
    });

    this.translateContent(content);
  };

  /**
   * Translates the content of the tooltip to keep it within the viewport.
   * @param {HTMLElement} contentNode - The content node of the tooltip.
   */
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
      contentNode.style("transform", undefined);
    }
  };
}
