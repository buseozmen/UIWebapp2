import React, { useEffect, useState } from "react";
import { addWkt, updateWkt } from "../services/api";

function WktForm({ currentItem, onSave }) {
  const [formData, setFormData] = useState({ name: "", wkt: "" });

  useEffect(() => {
    if (currentItem) setFormData(currentItem);
    else setFormData({ name: "", wkt: "" });
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = currentItem
        ? await updateWkt(formData)
        : await addWkt(formData);

      alert(result.message);
      onSave();
      setFormData({ name: "", wkt: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <div>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        </div>
        <div>
            <input name="wkt" value={formData.wkt} onChange={handleChange} placeholder="WKT" required />
        </div>
        <div>
            <button type="submit">{currentItem ? "Güncelle" : "Ekle"}</button>
            {currentItem && <button type="button" onClick={onSave}>İptal</button>}
        </div>
    </form>
  );
}

export default WktForm;



