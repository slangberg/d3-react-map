import { xml, select } from "d3";
/**
 * Class that will parse the asset config for the ImageMap and convert assets to symbols in the SVG defs.
 */
export default class AssetLoader {
  /**
   * Create an Asset Loader.
   * @param {Object} config - The configuration object.
   * @param {Object} config.container - The container object.
   * @param {Array} config.assets - The assets array.
   * @param {Object} config.svg - The SVG object.
   */
  constructor({ container, assets, svg }) {
    this.container = container;
    this.svg = svg;
    this.assets = Object.entries(assets).map(([key, value]) => ({
      symbolKey: key,
      ...value,
    }));
    this.loadAssets();
  }

  loadAssets() {
    const loadSvgContent = (url) => {
      return new Promise((resolve, reject) => {
        xml(url)
          .then((svgData) => {
            resolve(svgData);
          })
          .catch((error) => {
            console.error(`Failed to load SVG from ${url}`, error);
            reject(error);
          });
      });
    };

    Promise.all(this.assets.map(({ url }) => loadSvgContent(url)))
      .then((svgContents) => {
        svgContents.forEach((svgData, index) => {
          // Get the root SVG element
          const rootSvg = select(svgData).select("svg");
          const asset = this.assets[index];
          // Create a symbol and set the viewBox attribute
          const symbol = this.container
            .append("symbol")
            .attr("id", asset.symbolKey)
            .attr("viewBox", rootSvg.attr("viewBox"))
            .attr("width", rootSvg.attr("width"))
            .attr("height", rootSvg.attr("height"))
            .attr("transform-origin", "center center");

          // Append the children elements to the symbol
          rootSvg.selectAll("*").each(function () {
            symbol.node().appendChild(this.cloneNode(true));
          });
        });
        this.svg.dispatch("assetsLoaded");
      })
      .catch((error) => {
        console.error("Failed to load SVG contents:", error);
      });
  }
}
