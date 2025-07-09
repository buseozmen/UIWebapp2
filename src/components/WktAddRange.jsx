import React, { useState } from "react";
import { addRangeWkts } from "../services/api";

function WktAddRange({ onSave }) {
  const [items, setItems] = useState([{ name: "", wkt: "" }]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const handleAddRow = () => {
    setItems([...items, { name: "", wkt: "" }]);
  };

  const handleRemoveRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await addRangeWkts(items);
      alert(result.message);
      setItems([{ name: "", wkt: "" }]); // Reset
      onSave(); // Listeyi yenile
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Toplu WKT Ekleme</h2>
      {items.map((item, index) => (
        <div key={index}>
          <input
            name="name"
            placeholder="İsim"
            value={item.name}
            onChange={(e) => handleChange(index, e)}
            required
          />
          <input
            name="wkt"
            placeholder="WKT"
            value={item.wkt}
            onChange={(e) => handleChange(index, e)}
            required
          />
          {items.length > 1 && (
            <button type="button" onClick={() => handleRemoveRow(index)}>
              Sil
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddRow}>Satır Ekle</button>
      <button type="submit">Toplu Ekle</button>
    </form>
  );
}

export default WktAddRange;
