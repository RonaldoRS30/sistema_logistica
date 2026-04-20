import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { FilePlus, FileSpreadsheet, Loader2, Database, Calendar, Search, RefreshCw } from "lucide-react";
import ModalGrupoAnalitico from "./ModalGrupoAnalitico";
import ModalReporteGrupoAnalitico from "./ModalReporteGrupoAnalitico";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function GrupoAnalitico() {
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  
  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  // Filtros
  const [estado, setEstado] = useState("1");
  const [q, setQ] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(registros.length / rowsPerPage);

  const registrosPaginados = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return registros.slice(start, start + rowsPerPage);
  }, [registros, page]);

  const handleProcesar = async (overrideParams = null) => {
    setLoading(true);
    try {
      const res = await api.get("/cotizaciones/grupos-analiticos/", {
        params: overrideParams || {
          activo: estado,
          q: q.trim(),
        },
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setRegistros(data);
      setPage(1);
    } catch (e) {
      console.error("Error cargando grupos analíticos:", e);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProcesar();
  }, [estado]);

  const handleLimpiar = () => {
    setEstado("1");
    setQ("");
    setTimeout(() => handleProcesar({ activo: "1", q: "" }), 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-slate-100 min-h-screen"
    >
      {/* Header Estilo Premium */}
      <div className="bg-slate-900 text-white flex items-center gap-3 px-6 py-4 rounded-t-2xl shadow-xl border-b border-slate-800">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Database size={20} />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest uppercase">Grupos Analíticos</span>
            <span className="text-blue-400 text-[10px] font-bold tracking-tighter uppercase opacity-70">Categorización y Análisis del Almacén</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col rounded-b-2xl">
        {/* Toolbar Estilo Premium */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-4">
          <Button variant="outline" className="p-2 h-11 w-11 bg-white border-slate-200 text-blue-600 rounded-xl shadow-sm hover:bg-blue-50 transition-all">
            <Calendar size={18} />
          </Button>

          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
             <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="h-11 border border-slate-200 rounded-xl px-4 text-xs font-bold bg-white text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none min-w-[140px] shadow-sm transition-all cursor-pointer"
             >
                <option value="todos">-- Todos --</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
             </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-md">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda Rápida</label>
             <div className="relative">
                <input
                    type="text"
                    value={q}
                    placeholder="Código o Nombre del grupo..."
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleProcesar()}
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 pl-10 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition-all font-bold placeholder:text-slate-300"
                />
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
             </div>
          </div>

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
                onClick={() => {
                   setSeleccionado(null);
                   setModalOpen(true);
                }}
                className="h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
                <FilePlus size={16} className="text-blue-400" />
                Nuevo
            </Button>

            <Button
                onClick={() => setReporteModalOpen(true)}
                className="h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
                <FileSpreadsheet size={16} className="text-emerald-400" />
                Reporte
            </Button>
          </div>
        </div>

        {/* Tabla Estilo Premium */}
        <div className="overflow-auto bg-white min-h-[500px] flex-1">
          <table className="w-full text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#F2F5F8] z-10">
              <tr className="divide-x divide-slate-100 border-b border-slate-200 shadow-sm">
                <th className="w-14 py-4 bg-slate-100/50"></th>
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-left">Código Interno</th>
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-left">Descripción del Grupo Analítico</th>
                <th className="px-6 py-4 text-blue-600 font-black uppercase tracking-widest text-center w-24">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrosPaginados.length > 0 ? registrosPaginados.map((r, idx) => {
                const activo = normalizarBool(r.activo);
                return (
                  <tr
                    key={String(r.cod)}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-blue-50/50 transition-all cursor-pointer group divide-x divide-slate-100`}
                    onClick={() => {
                        setSeleccionado(r);
                        setModalOpen(true);
                    }}
                  >
                    <td className="w-14 text-center py-4">
                       <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm mx-auto w-fit group-hover:border-blue-300 group-hover:shadow-blue-100 transition-all">
                            <img src="/icons/folder.png" alt="" className="w-4 h-4 opacity-100" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/716/716784.png";
                                }}
                            />
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-black tracking-tight text-[12px]">{r.cod}</td>
                    <td className="px-6 py-4 text-slate-600 font-bold uppercase tracking-tight text-[11px] leading-tight">{r.nom}</td>
                    <td className="px-6 py-4 text-center">
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase inline-block tracking-widest shadow-sm ${activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {activo ? "ACTIVO" : "INACTIVO"}
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={4} className="py-24 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50/20">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={30} className="animate-spin text-blue-500" />
                                <span>Cargando Grupos...</span>
                            </div>
                        ) : "No existen grupos para mostrar"}
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Estilo Premium */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between text-[11px] font-black text-slate-600 border-t border-slate-200 rounded-b-2xl shadow-inner">
           <div className="flex items-center gap-3">
                <span className="bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm text-blue-600">{registros.length}</span>
                <span className="tracking-widest uppercase text-slate-400">Total de Grupos Analíticos</span>
           </div>
           
           <div className="flex items-center gap-8">
             <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Página {page} de {totalPages || 1}</div>
             <div className="flex gap-2">
                <button 
                   onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                   disabled={page === 1}
                   className="w-12 h-11 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold active:scale-90"
                >◄</button>
                <button 
                   onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
                   disabled={page >= totalPages}
                   className="w-12 h-11 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold active:scale-90"
                >►</button>
             </div>
           </div>
        </div>
      </div>

      <ModalGrupoAnalitico
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => handleProcesar()}
        grupo={seleccionado}
      />

      <ModalReporteGrupoAnalitico
        isOpen={reporteModalOpen}
        onClose={() => setReporteModalOpen(false)}
        filtros={{ q, estado }}
        registros={registros}
      />
    </motion.div>
  );
}
