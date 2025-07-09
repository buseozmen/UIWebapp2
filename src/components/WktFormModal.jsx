import React, { useState } from "react";
import { addWkt } from "../services/api";

function WktFormModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [wkt, setWkt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addWkt({ name, wkt });
      alert("Başarıyla eklendi");
      onSaved();  // Listeyi yenile
      onClose();  // Modalı kapat
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
        <h2>Yeni WKT Ekle</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
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
            <button type="submit">Kaydet</button>
            <button type="button" onClick={onClose}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WktFormModal;