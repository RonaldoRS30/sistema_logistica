import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import ModalReporteTabla from "./ModalReporteTabla";

const COLUMNAS = [
  { label: "Código",       render: (r) => <span className="font-mono font-black">{r.cod}</span> },
  { label: "Nombre",       render: (r) => <span className="uppercase">{r.nom}</span> },
  { label: "Abreviatura",  render: (r) => r.abr
    ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black">{r.abr}</span>
    : "—"
  },
];

export default function ModalReporteUmed({ isOpen, onClose, filtros, registros }) {
  const [downloading, setDownloading] = useState(false);

  const handleDescargar = async () => {
    if (!registros?.length) { toast.error("No hay registros para exportar."); return; }
    setDownloading(true);
    try {
      const response = await api.get("/cotizaciones/unidades-medida/reporte-excel/", {
        params: { q: filtros?.q || "" },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Unidades_Medida_${Date.now()}.xlsx`);
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
      titulo="REPORTE DE UNIDAD DE MEDIDA"
      registros={registros || []}
      columnas={COLUMNAS}
      onDescargar={handleDescargar}
      downloading={downloading}
    />
  );
}
