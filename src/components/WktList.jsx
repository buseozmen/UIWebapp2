import React, { useEffect, useState } from "react";
import { getAllWkts, deleteWkt } from "../services/api";


function WktList({ onEdit , refreshKey }) {
  const [wkts, setWkts] = useState([]);

  const fetchData = async () => {
    try {
      const result = await getAllWkts();
      if (result.success) setWkts(result.data);
      else alert(result.message);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);


  const handleDelete = async (id) => {
    if (!window.confirm("Bu kaydı silmek istediğine emin misin?")) return;
    try {
      const result = await deleteWkt(id);
      alert(result.message);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="table-container">
      <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h2>WKT Listesi</h2>
      </div>
      <table className="datatable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>WKT</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {wkts.map((item) => (
            <tr key={item.objectId}>
              <td>{item.objectId}</td>
              <td>{item.name}</td>
              <td>{JSON.stringify(item.wkt.type)  + JSON.stringify(item.wkt.coordinates)}</td>
              <td>
                <button className="edit" onClick={() => onEdit(item)}>Güncelle</button>
                <button className="delete" onClick={() => handleDelete(item.objectId)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WktList;


