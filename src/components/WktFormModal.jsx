import "../css/WktFormModal.css";
import React, { useEffect, useState } from "react";
import { addWkt, updateWkt } from "../services/api";

function WktFormModal({ isOpen, onClose, onSaved, currentItem }) {
  const [name, setName] = useState("");
  const [wkt, setWkt] = useState("");

  useEffect(() => {
  if (currentItem) {
    setName(currentItem.name || "");

    if (currentItem.wkt && currentItem.wkt.type && currentItem.wkt.coordinates) {
      const { type, coordinates } = currentItem.wkt;
      let wktString = "";

      if (type === "Point") {
        wktString = `POINT (${coordinates.join(" ")})`;
      } else if (type === "LineString") {
        wktString = `LINESTRING (${coordinates.map(c => c.join(" ")).join(", ")})`;
      } else if (type === "Polygon") {
        const outer = coordinates[0];
        wktString = `POLYGON ((${outer.map(c => c.join(" ")).join(", ")}))`;
      }

      setWkt(wktString);
    } 
  } else {
    setName("");
    setWkt("");
  }
}, [currentItem]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        // Güncelle
        await updateWkt({ objectId: currentItem.objectId, name, wkt });
        alert("Güncellendi");
      } else {
        // Yeni kayıt
        await addWkt({ name, wkt });
        alert("Eklendi");
      }

      onSaved();   // Listeyi yenile
      onClose();   // Modalı kapat
      setName("");
      setWkt("");
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{currentItem ? "WKT Güncelle" : "Yeni WKT Ekle"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="İsim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="WKT (örn: POINT (30 10))"
            value={wkt}
            onChange={(e) => setWkt(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button type="submit">{currentItem ? "Güncelle" : "Kaydet"}</button>
            <button type="button" className="cancel" onClick={onClose}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WktFormModal;
