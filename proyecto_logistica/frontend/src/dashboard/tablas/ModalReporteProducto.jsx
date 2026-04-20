import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import ModalReporteTabla from "./ModalReporteTabla";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

const COLUMNAS = [
  { label: "Reg",     render: (r) => r.reg },
  { label: "Código",  render: (r) => r.cod },
  { label: "Nombre",  render: (r) => <span className="uppercase">{r.nom}</span> },
  { label: "U.M.",    render: (r) => r.um || "—" },
  { label: "Stock",   render: (r) => <span className="font-bold">{r.can || 0}</span> },
  { label: "Soles",   render: (r) => r.sol || "0.00" },
  {
    label: "Activo",
    render: (r) => normalizarBool(r.activo)
      ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">SÍ</span>
      : <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black">NO</span>,
  },
];

export default function ModalReporteProducto({ isOpen, onClose, filtros, registros }) {
  const [downloading, setDownloading] = useState(false);

  const handleDescargar = async () => {
    if (!registros?.length) { toast.error("No hay registros para exportar."); return; }
    setDownloading(true);
    try {
      const response = await api.get("/cotizaciones/productos/reporte-excel/", {
        params: {
          q: filtros?.q || "",
          activo: filtros?.estado || "todos",
          grupo: filtros?.grupo || "todos",
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Productos_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel descargado correctamente.");
    } catch { toast.error("Error al descargar el reporte."); }
    finally { setDownloading(false); }
  };

  return (
    <ModalReporteTabla
      isOpen={isOpen}
      onClose={onClose}
      titulo="REPORTE DE PRODUCTOS / ARTÍCULOS"
      registros={registros || []}
      columnas={COLUMNAS}
      onDescargar={handleDescargar}
      downloading={downloading}
    />
  );
}
