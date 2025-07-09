import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";
import { getAllWkts } from "../services/api";

function MapView({ onWktGenerated, refreshKey, shouldClearTempFeature }) {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [drawType, setDrawType] = useState("Point");
  const tempFeatureRef = useRef(null);

  // 🗺 Haritayı başlat
  useEffect(() => {
    const rasterLayer = new TileLayer({ source: new OSM() });
    const vectorLayer = new VectorLayer({ source: vectorSourceRef.current });

    const map = new Map({
      target: mapRef.current,
      layers: [rasterLayer, vectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapInstanceRef.current = map;
    addDrawInteraction(drawType);

    return () => map.setTarget(null);
  }, []);
  

  // ✏️ Çizim tipi değişince interaction değiştir
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (drawInteractionRef.current) {
      mapInstanceRef.current.removeInteraction(drawInteractionRef.current);
    }

    addDrawInteraction(drawType);
  }, [drawType]);

  // 🔁 Her refreshKey değişiminde WKT verilerini yeniden yükle
  useEffect(() => {
    loadExistingWkts();
  }, [refreshKey]);

  // 📥 Veritabanından gelen WKT'leri haritada göster
  const loadExistingWkts = async () => {
  try {
    vectorSourceRef.current.clear(); // önce temizle

    const result = await getAllWkts();
    if (result.success) {
      const format = new GeoJSON(); // GeoJSON okuyucu

      result.data.forEach((item) => {
        try {
          const feature = format.readFeature({
            type: "Feature",
            geometry: item.wkt,
            properties: {} // eğer name gibi şeyleri de göstermek istersen buraya ekle
          }, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          });

          vectorSourceRef.current.addFeature(feature);
        } catch (e) {
          console.warn("Geometry okunamadı:", item.wkt);
        }
      });
    }
  } catch (error) {
    console.error("WKT verileri yüklenemedi:", error);
  }
};


  // 🖋 Yeni çizim yapılınca tetiklenir
  const addDrawInteraction = (type) => {
    const draw = new Draw({
      source: vectorSourceRef.current,
      type,
    });

    draw.on("drawend", (event) => {
      const format = new WKT();
      const wkt = format.writeFeature(event.feature, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      tempFeatureRef.current = event.feature; // geçici feature'ı tut
       if (onWktGenerated) onWktGenerated(wkt);
    });

    mapInstanceRef.current.addInteraction(draw);
    drawInteractionRef.current = draw;
  };

  useEffect(() => {
  if (shouldClearTempFeature && tempFeatureRef.current) {
    vectorSourceRef.current.removeFeature(tempFeatureRef.current);
    tempFeatureRef.current = null;
  }
}, [shouldClearTempFeature]);

  return (
    <div>
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        <label htmlFor="geomType">Geometri Türü: </label>
        <select
          id="geomType"
          value={drawType}
          onChange={(e) => setDrawType(e.target.value)}
        >
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
        </select>
      </div>

      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default MapView;




