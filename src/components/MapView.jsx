import React, { useRef, useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

const MapView = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0], 
        zoom: 2,
      }),
    });

    return () => map.setTarget(null); 
  }, []);

  return (
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      ></div>
    
  );
};

export default MapView;
