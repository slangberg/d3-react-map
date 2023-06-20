import logo from "./logo.svg";
import "./App.css";
import 'animate.css';
import { useEffect } from "react";
import ImageMap from "./image-map/ImageMap";
import mapUrl from "./image-map/map.jpeg";
import pinUrl from "./image-map/marker.svg";
let map;
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
    ];

    // const assets = [{ url : pinUrl, id: "marker", offset: [28, 60], tooltipOffset: [0, 0]}]

    const assets = {
      base: {
        url: pinUrl,
        id: "base",
        width: 60,
        height: 60,
        offset: [-28, -60],
        toolTipOffset: [0, 0],
      },
    };

    if (!map) {
      map = new ImageMap({
        containerId: "floorplan",
        imageData,
        markersData,
        assets,
        single: true
      });
    }
  }, []);
  return (
    <div>
      <header className="App-header">Test</header>
      <svg id="floorplan"></svg>
    </div>
  );
}

export default App;
