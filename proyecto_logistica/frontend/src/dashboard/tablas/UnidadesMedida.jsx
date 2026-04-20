import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import {
  FilePlus, FileSpreadsheet, Loader2, Ruler,
  Search, RefreshCw,
} from "lucide-react";
import ModalUnidadMedida from "./ModalUnidadMedida";
import ModalReporteUmed from "./ModalReporteUmed";


export default function UnidadesMedida() {
  const [loading, setLoading]       = useState(false);
  const [registros, setRegistros]   = useState([]);
  const [modalOpen, setModalOpen]       = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [q, setQ]                   = useState("");

  const [page, setPage]         = useState(1);
  const rowsPerPage             = 15;
  const totalPages              = Math.ceil(registros.length / rowsPerPage);

  const registrosPaginados = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return registros.slice(start, start + rowsPerPage);
  }, [registros, page]);

  // ---- Carga / búsqueda ----
  const handleProcesar = async (overrideParams = null) => {
    setLoading(true);
    try {
      const params = overrideParams ?? { q: q.trim() };
      const res = await api.get("/cotizaciones/unidades-medida/", { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setRegistros(data);
      setPage(1);
    } catch (e) {
      console.error("Error cargando unidades de medida:", e);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { handleProcesar(); }, []);

  const handleLimpiar = () => {
    setQ("");
    setTimeout(() => handleProcesar({ q: "" }), 50);
  };

  // ---- Reporte: abre modal ----
  const handleReporte = () => setReporteModalOpen(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-slate-100 min-h-screen"
    >
      {/* Header Premium */}
      <div className="bg-slate-900 text-white flex items-center gap-3 px-6 py-4 rounded-t-2xl shadow-xl border-b border-slate-800">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Ruler size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-widest uppercase">
            Catálogo de Unidades de Medida
          </span>
          <span className="text-blue-400 text-[10px] font-bold tracking-tighter uppercase opacity-70">
            Gestión de Magnitudes y Abreviaturas
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col rounded-b-2xl">
        {/* Toolbar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-4">

          {/* Búsqueda */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-md">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <input
                type="text"
                value={q}
                placeholder="Código, Nombre o Abreviatura..."
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProcesar()}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 pl-10 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition-all font-bold placeholder:text-slate-300"
              />
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2.5 items-end pt-5">
            <Button
              onClick={() => handleProcesar()}
              disabled={loading}
              className="h-11 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Procesar
            </Button>

            <Button
              onClick={handleLimpiar}
              disabled={loading}
              className="h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-black px-6 gap-2 rounded-xl shadow-sm uppercase tracking-widest transition-all active:scale-95"
            >
              <RefreshCw size={16} className="text-amber-500" />
              Limpiar
            </Button>

            <Button
              onClick={() => { setSeleccionado(null); setModalOpen(true); }}
              className="h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
              <FilePlus size={16} className="text-blue-400" />
              Nuevo
            </Button>

            <Button
              onClick={handleReporte}
              className="h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              Reporte
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-auto bg-white min-h-[500px] flex-1">
          <table className="w-full text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#F2F5F8] z-10">
              <tr className="divide-x divide-slate-100 border-b border-slate-200 shadow-sm">
                <th className="w-14 py-4 bg-slate-100/50" />
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-left">Código</th>
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-left">Nombre / Descripción</th>
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-center">Abreviatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrosPaginados.length > 0
                ? registrosPaginados.map((r, idx) => (
                  <tr
                    key={r.cod}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-blue-50/50 transition-all cursor-pointer group divide-x divide-slate-100`}
                    onClick={() => { setSeleccionado(r); setModalOpen(true); }}
                  >
                    <td className="w-14 text-center py-4">
                      <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm mx-auto w-fit group-hover:border-blue-300 group-hover:shadow-blue-100 transition-all">
                        <Ruler size={14} className="text-blue-500 opacity-70" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-black tracking-tight text-[12px] font-mono">
                      {r.cod}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-bold uppercase tracking-tight text-[11px] leading-tight">
                      {r.nom || "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.abr
                        ? (
                          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase inline-block tracking-widest shadow-sm bg-blue-100 text-blue-700">
                            {r.abr}
                          </span>
                        )
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                  </tr>
                ))
                : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50/20">
                      {loading
                        ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 size={30} className="animate-spin text-blue-500" />
                            <span>Sincronizando Unidades de Medida...</span>
                          </div>
                        )
                        : "No existen registros"
                      }
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        {/* Footer / Paginación */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between text-[11px] font-black text-slate-600 border-t border-slate-200 rounded-b-2xl shadow-inner">
          <div className="flex items-center gap-3">
            <span className="bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm text-blue-600">
              {registros.length}
            </span>
            <span className="tracking-widest uppercase text-slate-400">Total de Unidades</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
              Página {page} de {totalPages || 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setPage((p) => Math.max(1, p - 1)); }}
                disabled={page === 1}
                className="w-12 h-11 bg-white border border-slate-200 rounded-xl shadow-sm hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold active:scale-90"
              >◄</button>
              <button
                onClick={(e) => { e.stopPropagation(); setPage((p) => Math.min(totalPages, p + 1)); }}
                disabled={page >= totalPages}
                className="w-12 h-11 bg-white border border-slate-200 rounded-xl shadow-sm hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold active:scale-90"
              >►</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      <ModalUnidadMedida
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => handleProcesar()}
        unidad={seleccionado}
      />

      <ModalReporteUmed
        isOpen={reporteModalOpen}
        onClose={() => setReporteModalOpen(false)}
        filtros={{ q }}
        registros={registros}
      />
    </motion.div>
  );
}
