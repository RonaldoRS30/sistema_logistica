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
  { label: "Código", render: (r) => <span className="font-mono font-black">{r.cod}</span> },
  { label: "Nombre / Documento", render: (r) => r.nom || "—" },
  {
    label: "Activo",
    render: (r) => normalizarBool(r.activo)
      ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">SÍ</span>
      : <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black">NO</span>,
  },
];

export default function ModalReporteDocAlmacen({ isOpen, onClose, filtros, registros }) {
  const [downloading, setDownloading] = useState(false);

  const handleDescargar = async () => {
    if (!registros?.length) { toast.error("No hay registros para exportar."); return; }
    setDownloading(true);
    try {
      const response = await api.get("/cotizaciones/doc-almacen/reporte-excel/", {
        params: {
          activo: filtros?.activo || "todos",
          q:      filtros?.q      || "",
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Documentos_Almacen_${Date.now()}.xlsx`);
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
      titulo="REPORTE DE DOCUMENTOS DE ALMACÉN"
      registros={registros || []}
      columnas={COLUMNAS}
      onDescargar={handleDescargar}
      downloading={downloading}
    />
  );
}
