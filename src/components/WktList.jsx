import React, { useEffect, useState } from "react";
import { getAllWkts, deleteWkt } from "../services/api";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';


function WktList({ onEdit , refreshKey, onChanged }) {
  const [wkts, setWkts] = useState([]);

  const fetchData = async () => {
    try {
      const result = await getAllWkts();
      if (result.success) setWkts(result.data);
      else toast.error(result.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);


  const handleDelete = async (id) => {
    const result = await Swal.fire({
    title: "Emin misin?",
    text: "Bu kaydı silmek istediğine emin misin?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Evet, sil!",
    cancelButtonText: "İptal"
    });

    if (result.isConfirmed){
      try {
      const result = await deleteWkt(id);
      toast.success(result.message);
      fetchData();
      onChanged?.();
      } catch (error) {
        toast.error(error.message);
      }
    };
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


