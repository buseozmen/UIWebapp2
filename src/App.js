import React, { useState } from "react";
import WktList from "./components/WktList";
import MapView from "./components/MapView";
import WktFormModal from "./components/WktFormModal";
import "./App.css";


function App() {
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = () => {
    setSelected(null);
    setRefreshKey(prev => prev + 1);
  };

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="App">
      <h1>Başarsoft Map App</h1>
      <MapView/>
      <div>
        <button className="add" onClick={() => { setSelected(null); setModalOpen(true); }}>WKT Ekle</button>
      </div>
      <WktFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        onSaved={refresh}
        currentItem={selected}
      />
      <WktList onEdit={(item) => { setSelected(item); setModalOpen(true); }} refreshKey={refreshKey} />
    </div>
  );
}

export default App;


