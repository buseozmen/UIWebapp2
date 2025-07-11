import "../css/WktFormModal.css";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { addWkt, updateWkt } from "../services/api";

function WktFormModal({ isOpen, onClose, onSaved, currentItem, mapWkt }) {
  const [name, setName] = useState("");
  const [wkt, setWkt] = useState("");


  const handleClose = () => {
  setName("");
  setWkt("");
  onClose();
  };

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
    } else {
      setWkt("");
    }

  } else {
    setName("");
    // Eğer yeni kayıt ve harita üzerinden çizim geldiyse formu onunla doldur
    setWkt(mapWkt || "");
  }
  return () => {
    setName("");
    setWkt("");
  };
}, [currentItem, mapWkt]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

        let result;
        if (currentItem) {
        result = await updateWkt({ objectId: currentItem.objectId, name, wkt });
        if (result.success) {
            toast.success("Güncellendi");
        } else {
            toast.error("Güncelleme başarısız: " + result.message);
            return;
        }
        } else {
        result = await addWkt({ name, wkt });
        if (result.success) {
            toast.success("Eklendi");
        } else {
            toast.error("Ekleme başarısız: " + result.message);
            return;
        }
        }

      onSaved();   // Listeyi yenile
      window.dispatchEvent(new Event("wkt-draw-cancel")); // geçici çizimi temizle
      handleClose();
    } catch (error) {
      toast.error(error.message);
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
            <button type="button" className="cancel" onClick={() => {
                handleClose();
                window.dispatchEvent(new Event("wkt-draw-cancel"))}}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WktFormModal;
