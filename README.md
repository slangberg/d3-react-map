### D3-ImageMap Class Documentation

The D3-ImageMap is a powerful tool for creating interactive image maps with markers and tooltips. It leverages the capabilities of the d3 library and provides an intuitive interface for displaying and interacting with images.

## Key Features:

- Easily create interactive image maps with markers that can be clicked and interacted with.
- Easily use existing SVGs for markers with not required changes to the SVG code
- Display tooltips associated with each marker to provide additional information or context.
- Support for multi-selection mode to enable selecting multiple markers simultaneously.
- Zooming and panning functionality for detailed exploration of the image map.
- Event system to handle various interactions and trigger custom actions.

## Getting Started

To use the D3-ImageMa class, follow these steps:

- Create an instance of the ImageMap class with a configuration object specifying the necessary parameters such as `containerId`, `imageData`, `markersData`, `assets`, and `multiSelectionMode`.
- Use the `getEventAPI` to get access to the map event listeners and dispatchers

## API Example

## Actions

#### api.zoomToPosition
Registers a callback for the `zoomToPosition` event.
- **callback** (`Function`): The callback function.
  - `callback.config` (`Object`): The configuration object.
    - `callback.config.x` (`number`): The x-coordinate.
    - `callback.config.y` (`number`): The y-coordinate.
    - `callback.config.zoomLevel` (`number`): The zoom level.

#### api.zoomToMarker
Registers a callback for the `zoomToMarker` event.
- **callback** (`Function`): The callback function.
  - `callback.id` (`string`): The ID of the marker.

#### api.centerMap
Registers a callback for the `centerMap` event.
- **callback** (`Function`): The callback function.

#### api.zoomToContainElement
Registers a callback for the `zoomToContainElement` event.
- **callback** (`Function`): The callback function.
  - `callback.id` (`string`): The ID of the element.

#### api.removeTooltip
Registers a callback for the `removeTooltip` event.
- **callback** (`Function`): The callback function.
  - `callback.id` (`string`): The ID of the tooltip.

#### api.showTooltip
Registers a callback for the `showTooltip` event.
- **callback** (`Function`): The callback function.
  - `callback.id` (`string`): The ID of the tooltip.


## Events

#### api.onMarkerClick
Registers a callback for the `onMarkerClick` event, which fires when a user clicks a marker.
- **callback** (`Function`): The callback function.
  - `callback.data` (`Object`): The data related to the marker click.
  

#### api.onPanZoom
Registers a callback for the `onPanZoom` event which fires whenever a user pans or zooms the map.
- **callback** (`Function`): The callback function.
  - `data` (`Object`): The data related to the current pan and zoom event.
  

#### api.onTooltipShow
Registers a callback for the `onTooltipShow` event, which fires when a tooltip is rendered over the map
- **callback** (`Function`): The callback function.
  - `data` (`Object`): The data related to the tooltip and marker that the tooltip is bound too

#### api.onTooltipHide
Registers a callback for the `onTooltipHide` event.
- **callback** (`Function`): The callback function.
  - `data` (`Object`): The data related to the tooltip and marker that the tooltip is bound too


#### api.onImageLoad
Registers a callback for the `onImageLoad` event, which fires when the map image is loaded into the DOM.
- **callback** (`Function`): The callback function.

#### api.onAssetLoad
Registers a callback for the `onAssetLoad` event, which fires when the all of the map assets have finished being injected into the map svg.
- **callback** (`Function`): The callback function.
  - `data` (`Object`): The list of symbol nodes loaded and assets data used to load them

#### api.onLoad
Registers a callback for the `onLoad` event, which fires when the map image and assets have finished their load events.
- **callback** (`Function`): The callback function.