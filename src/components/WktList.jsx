import React, { useEffect, useState } from "react";
import { getAllWkts, deleteWkt } from "../services/api";
import DataTable from "react-data-table-component";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { textHeights } from "ol/render/canvas";


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
      setWkts(prev => prev.filter(item => item.objectId !== id));
      onChanged?.();
      } catch (error) {
        toast.error(error.message);
      }
    };
  };


  const columns = [
    { name: 'ID', selector: row => row.objectId, width: "80px" },
    { name: 'Name', selector: row => row.name, wrap: true },
    { name: 'WKT', selector: row => {

          if (!row.wkt || !row.wkt.type || !row.wkt.coordinates) return "";
          const { type, coordinates } = row.wkt;

          if (type === "Point") {
            return `POINT (${coordinates.join(" ")})`;
          } else if (type === "LineString") {
            return `LINESTRING (${coordinates.map(c => c.join(" ")).join(", ")})`;
          } else if (type === "Polygon") {
            const outer = coordinates[0]; // sadece dış çember
            return `POLYGON ((${outer.map(c => c.join(" ")).join(", ")}))`;
          }
          return type;
        },
        wrap: true,
        grow: 2
    },
    {
      name: 'İşlemler',
      cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="edit" onClick={() => onEdit(row)}>Güncelle</button>
          <button className="delete" onClick={() => handleDelete(row.objectId)}>Sil</button>
        </div>
      ),
      button: true,
      width: "160px"
    }
  ];

 const customStyles = {
    rows: {
      style: {
        minHeight: '40px',
        fontSize: '13px',
        paddingTop: '4px',
        paddingBottom: '4px'
      }
    },
    headCells: {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: '#f2f2f2'
      }
    },
    cells: {
      style: {
        padding: '6px'
      }
    }
  };


  return (
    <div className="table-container">
      <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h2>WKT Listesi</h2>
      </div>
      <DataTable
        columns={columns}
        data={wkts}
        style={customStyles}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
}

export default WktList;


