import React, { useState , useEffect } from "react";
import WktList from "./components/WktList";
import MapView from "./components/MapView";
import WktFormModal from "./components/WktFormModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";


function App() {
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [wkt, setWkt] = useState("");
  const [shouldClearTempFeature, setShouldClearTempFeature] = useState(false);
  

  const refresh = () => {
    setSelected(null);
    setRefreshKey(prev => prev + 1);
  };

    useEffect(() => {
    const handleCancel = () => {
      setShouldClearTempFeature(true);
      setTimeout(() => setShouldClearTempFeature(false), 100); // kısa süreli tetikleme
    };
    window.addEventListener("wkt-draw-cancel", handleCancel);
    return () => window.removeEventListener("wkt-draw-cancel", handleCancel);
  }, []);

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="App">
      <h1>Başarsoft Map App</h1>
      <MapView
        onWktGenerated={(wktString) => {
          setWkt(wktString);      // Haritadan gelen veriyi al
          setSelected(null);      // Yeni kayıt olacağı için selected temizleniyor
          setModalOpen(true);     // Modalı otomatik aç
        }}
        refreshKey={refreshKey}
        shouldClearTempFeature={shouldClearTempFeature}
      />
      <div>
        <button className="add" onClick={() => { setSelected(null); setModalOpen(true); }}>WKT Ekle</button>
      </div>
      <WktFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); setWkt("");  window.dispatchEvent(new Event("wkt-draw-cancel")); }}
        onSaved={refresh}
        currentItem={selected}
        mapWkt={wkt}
      />
      <WktList onEdit={(item) => { setSelected(item); setModalOpen(true); }} refreshKey={refreshKey}  onChanged={refresh} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;


