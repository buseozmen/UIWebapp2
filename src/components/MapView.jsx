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
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Overlay from 'ol/Overlay';
import { toast } from 'react-toastify';

function MapView({ onWktGenerated, refreshKey, shouldClearTempFeature }) {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [drawType, setDrawType] = useState("Point");
  const tempFeatureRef = useRef(null);
  const popupRef = useRef();
  const overlayRef = useRef();


  const featureStyleFunction = (feature) => {
    return new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)',
      }),
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'white', width: 1 }),
      }),
      text: new Text({
        text: `${feature.get('name')}`,
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        offsetY: -15,
      }),
    });
  };

  // 🗺 Haritayı başlat
  useEffect(() => {
  const rasterLayer = new TileLayer({ source: new OSM() });
  const vectorLayer = new VectorLayer({ source: vectorSourceRef.current, style: featureStyleFunction });

  const map = new Map({
    target: mapRef.current,
    layers: [rasterLayer, vectorLayer],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });

  mapInstanceRef.current = map;

  // 🧩 POPUP OVERLAY
  overlayRef.current = new Overlay({
    element: popupRef.current,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -15],
  });
  map.addOverlay(overlayRef.current);

  map.on('pointermove', function (evt) {
    if (evt.dragging) return;

    const pixel = map.getEventPixel(evt.originalEvent);
    const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, { hitTolerance: 200 });

    if (feature && feature.get("isPersistent")) {
      const coordinates = evt.coordinate;
      const name = feature.get('name') || 'İsim yok';
      const format = new WKT();
      const wkt = format.writeFeature(feature, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      popupRef.current.innerHTML = `
        <div style="background:white;padding:4px 8px;border:1px solid #ccc;border-radius:4px;">
          <strong>${name}</strong><br/>
          <small>${wkt}</small>
        </div>`;
      overlayRef.current.setPosition(coordinates);
      popupRef.current.style.display = 'block';
    } else {
      overlayRef.current.setPosition(undefined);
      popupRef.current.style.display = 'none';
    }
  });

  addDrawInteraction(drawType);

  // ✅ ESC tuşuna basınca geçici çizimi iptal et
    const handleKeyDown = (e) => {
    if (e.key === "Escape" && drawInteractionRef.current) {
      drawInteractionRef.current.abortDrawing();
      toast.info("Çizim iptal edildi");
   
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    map.setTarget(null);
    window.removeEventListener("keydown", handleKeyDown);
  };
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

            feature.set('name', item.name);
            feature.set('isPersistent', true);
            vectorSourceRef.current.addFeature(feature);
          } catch (e) {
            toast.error("Geometry okunamadı:", item.wkt);
          }
        });
      }
    } catch (error) {
      toast.error("WKT verileri yüklenemedi:", error);
    }
  };


  // 🖋 Yeni çizim yapılınca tetiklenir
  const addDrawInteraction = (type) => {
    const draw = new Draw({
      source: vectorSourceRef.current,
      type,
    });

    draw.on("drawstart", (event) => {
    // Her yeni çizime başlarken öncekini temizle
    if (tempFeatureRef.current) {
      vectorSourceRef.current.removeFeature(tempFeatureRef.current);
      tempFeatureRef.current = null;
    }
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
        style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
      />
      <div ref={popupRef} style={{ position: 'absolute', display: 'none', pointerEvents: 'none', zIndex: 1000 }} />
    </div>
  );
}

export default MapView;




