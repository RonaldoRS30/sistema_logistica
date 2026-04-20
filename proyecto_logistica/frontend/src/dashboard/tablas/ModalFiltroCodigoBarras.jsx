import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, Loader2, Barcode } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

export default function ModalFiltroCodigoBarras({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    codigoInicial: "",
    codigoFinal: "",
    soloCodigoBarras: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleGenerarReporte = async () => {
    setLoading(true);
    try {
      // Ajusta la URL de este endpoint cuando se implemente la lógica de exportación de código de barras
      const response = await api.get("/cotizaciones/productos/reporte-barras-excel/", {
        params: filtros,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Codigo_Barras_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel de código de barras descargado.");
    } catch (error) {
      toast.error("Error al descargar el reporte de código de barras.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300"
        >
          {/* Header */}
          <div className="bg-[#1e2a3a] px-5 py-3 flex items-center justify-between border-b border-[#121c26]">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-white" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">
                CÓDIGO DE BARRAS PRODUCTOS
              </h2>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-2 gap-6 bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Código inicial:</label>
                <input
                  type="text"
                  name="codigoInicial"
                  value={filtros.codigoInicial}
                  onChange={handleChange}
                  className="w-full text-center h-9 border border-slate-300 rounded font-bold text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Código Final:</label>
                <input
                  type="text"
                  name="codigoFinal"
                  value={filtros.codigoFinal}
                  onChange={handleChange}
                  className="w-full text-center h-9 border border-slate-300 rounded font-bold text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2 flex justify-end items-center gap-3 mt-4 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold inline-flex items-center gap-2 cursor-pointer">
                  Solo Codigo de Barras
                  <input
                    type="checkbox"
                    name="soloCodigoBarras"
                    checked={filtros.soloCodigoBarras}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 pointer-events-auto"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 px-6 py-4 flex justify-end gap-3 border-t border-slate-300">
             <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-t from-slate-200 to-white hover:from-slate-300 hover:to-slate-50 border border-slate-300 rounded text-slate-700 font-bold text-xs uppercase shadow-sm flex items-center gap-2 active:scale-95 transition-transform"
             >
               {loading ? <Loader2 size={14} className="animate-spin" /> : "Reporte"}
             </button>
             <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-t from-slate-200 to-white hover:from-slate-300 hover:to-slate-50 border border-slate-300 rounded text-slate-700 font-bold text-xs uppercase shadow-sm active:scale-95 transition-transform"
             >
               Salir
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
