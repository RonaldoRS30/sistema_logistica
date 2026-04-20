import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { FilePlus, FileSpreadsheet, Loader2, Warehouse, Calendar, Search, RefreshCw } from "lucide-react";
import ModalCcosto from "./ModalCcosto";
import ModalReporteCcosto from "./ModalReporteCcosto";


const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function CentrosCosto() {
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);


  // Filtros
  const [estado, setEstado] = useState("todos");
  const [campoBusqueda, setCampoBusqueda] = useState("Nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(registros.length / rowsPerPage);

  const registrosPaginados = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return registros.slice(start, start + rowsPerPage);
  }, [registros, page]);

  useEffect(() => {
    handleProcesar();
  }, []);

  const handleProcesar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cotizaciones/centros-costo/", {
        params: {
          activo: estado,
          campo: campoBusqueda,
          valor: valorBusqueda.trim(),
        },
      });
      setRegistros(Array.isArray(res.data) ? res.data : []);
      setPage(1);
    } catch (e) {
      console.error("Error cargando centros de costo:", e);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setEstado("todos");
    setCampoBusqueda("Nombre");
    setValorBusqueda("");
    setTimeout(() => handleProcesar(), 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-slate-100 min-h-screen"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white flex items-center gap-3 px-6 py-3 rounded-t-2xl shadow-xl border-b border-slate-800">
        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Warehouse size={20} />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest uppercase">Centro de Costo Almacenes</span>
            <span className="text-blue-400 text-[10px] font-bold tracking-tighter uppercase opacity-70">Catálogo de Entidades</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col rounded-b-2xl">
        {/* Toolbar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-4">
          <Button variant="outline" className="p-2 h-10 w-10 bg-white border-slate-200 text-blue-600 rounded-xl shadow-sm hover:bg-blue-50 transition-all">
            <Calendar size={18} />
          </Button>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="h-10 border border-slate-200 rounded-xl px-4 text-[12px] font-bold bg-white text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none min-w-[140px] shadow-sm transition-all cursor-pointer"
          >
            <option value="todos">-- Todos --</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>

          <select
            value={campoBusqueda}
            onChange={(e) => setCampoBusqueda(e.target.value)}
            className="h-10 border border-slate-200 rounded-xl px-4 text-[12px] font-bold bg-white text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all cursor-pointer"
          >
            <option value="Codigo">Codigo</option>
            <option value="Nombre">Nombre</option>
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              value={valorBusqueda}
              placeholder="Buscar por valor..."
              onChange={(e) => setValorBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcesar()}
              className="w-full h-10 border border-slate-200 rounded-xl px-4 text-[12px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition-all"
            />
          </div>

          <div className="flex gap-2">
            <Button
                onClick={handleProcesar}
                disabled={loading}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all active:scale-95"
            >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Procesar
            </Button>

            <Button
                onClick={handleLimpiar}
                disabled={loading}
                className="h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-black px-6 gap-2 rounded-xl shadow-sm uppercase tracking-widest transition-all active:scale-95"
            >
                <RefreshCw size={15} className="text-amber-500" />
                Limpiar
            </Button>

            <Button
                onClick={() => {
                setSeleccionado(null);
                setModalOpen(true);
                }}
                className="h-10 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
                <FilePlus size={15} className="text-blue-400" />
                Nuevo
            </Button>

            <Button
                onClick={() => setReporteModalOpen(true)}
                className="h-10 bg-slate-900 hover:bg-black text-white text-[11px] font-black px-6 gap-2 rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95"
            >
                <FileSpreadsheet size={15} className="text-emerald-400" />
                Reporte
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-auto bg-white min-h-[500px] flex-1">
          <table className="w-full text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#F2F5F8] z-10">
              <tr className="divide-x divide-slate-100 border-b border-slate-200">
                <th className="w-14 py-3 bg-slate-100/50"></th>
                <th className="px-6 py-3 text-blue-600 font-black uppercase tracking-widest text-left">Codigo</th>
                <th className="px-6 py-3 text-blue-600 font-black uppercase tracking-widest text-left">Nombre del Centro de Costo</th>
                <th className="px-6 py-3 text-blue-600 font-black uppercase tracking-widest text-center w-24">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrosPaginados.length > 0 ? registrosPaginados.map((r, idx) => {
                const activo = normalizarBool(r.activo);
                return (
                  <tr
                    key={r.cod}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-blue-50/50 transition-all cursor-pointer group divide-x divide-slate-100`}
                    onClick={() => {
                      setSeleccionado(r);
                      setModalOpen(true);
                    }}
                  >
                    <td className="w-14 text-center py-4">
                       <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm mx-auto w-fit group-hover:border-blue-300 transition-colors">
                            <img src="/icons/folder.png" alt="" className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/716/716784.png";
                                }}
                            />
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-black tracking-tight text-[12px]">{r.cod}</td>
                    <td className="px-6 py-4 text-slate-600 font-bold uppercase tracking-tight text-[11px]">{r.nom}</td>
                    <td className="px-6 py-4 text-center">
                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase inline-block tracking-widest ${activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {activo ? "ACTIVO" : "INACTIVO"}
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        No se encontraron registros activos
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 flex items-center justify-between text-[11px] font-black text-slate-600 border-t border-slate-200 rounded-b-2xl shadow-inner">
           <div className="flex items-center gap-2">
                <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{registros.length}</span>
                <span className="tracking-widest uppercase">Registro(s)</span>
           </div>
           
           <div className="flex items-center gap-6">
             <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Página {page} de {totalPages || 1}</div>
             <div className="flex gap-2">
                <button 
                   onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                   disabled={page === 1}
                   className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold"
                >◄</button>
                <button 
                   onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
                   disabled={page >= totalPages}
                   className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:text-blue-600 disabled:opacity-30 transition-all flex items-center justify-center font-bold"
                >►</button>
             </div>
           </div>
        </div>
      </div>

      <ModalCcosto
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => handleProcesar()}
        ccosto={seleccionado}
      />

      <ModalReporteCcosto
        isOpen={reporteModalOpen}
        onClose={() => setReporteModalOpen(false)}
        filtros={{ activo: estado, campo: campoBusqueda, valor: valorBusqueda }}
        registros={registros}
      />
    </motion.div>
  );
}
