import logo from "./logo.svg";
import "./App.css";
import "animate.css";
import { useEffect } from "react";
import ImageMap from "./image-map/ImageMap";
import mapUrl from "./image-map/map.jpeg";
import pinUrl from "./image-map/marker-2.svg";
import markerUrl from "./image-map/marker.svg";
let map;
let api;
function App() {
  useEffect(() => {
    const imageData = {
      width: 1454,
      height: 1122,
      path: mapUrl,
    };

    const markersData = [
      { x: 0, y: 0, marker: "base", name: "Marker 1", id: 0 },
      { x: 100, y: 100, marker: "base", name: "Marker 2", id: 1 },
      { x: 200, y: 200, marker: "base", name: "Marker 3", id: 3 },
      { x: 300, y: 300, marker: "base", name: "Marker 4", id: 4 },
      { x: 660, y: 660, marker: "side", name: "Shape", id: 5 },
    ];

    // const assets = [{ url : pinUrl, id: "marker", offset: [28, 60], tooltipOffset: [0, 0]}]

    const assets = {
      base: {
        url: pinUrl,
        id: "base",
        width: 60,
        height: 60,
        offset: [-31, -55],
        toolTipOffset: [0, 0],
      },
      side: {
        url: markerUrl,
        id: "side",
        width: 200,
        height: 200,
      }
    };

    if (!map) {
      map = new ImageMap({
        containerId: "floorplan",
        imageData,
        markersData,
        assets,
        single: true,
      });
      api = map.getEventApi();
    }
  }, []);
  return (
    <div>
      <header className="App-header">
        <button
          onClick={() =>
            api.zoomToPosition({ x: 100, y: 100, zoomLevel: 3 })
          }
        >
          Pan and Zoom
        </button>
        <button
          onClick={() =>
            api.centerMap()
          }
        >
          Center
        </button>
        <button
          onClick={() =>
            api.zoomToMarker(0)
          }
        >
          Zoom To Marker
        </button>
        <button
          onClick={() =>
            api.zoomToContainElement(5)
          }
        >
          Zoom To Contain
        </button>
      </header>
      <svg id="floorplan"></svg>
    </div>
  );
}

export default App;
