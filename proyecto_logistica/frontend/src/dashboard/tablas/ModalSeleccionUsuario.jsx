import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, Loader2 } from "lucide-react";
import api from "@/services/api";

export default function ModalSeleccionUsuario({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("usuarios-activos/", { params: { q } });
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsuarios(query);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchUsuarios(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-600 rounded-lg text-white">
                <User size={18} />
              </div>
              <h3 className="text-white font-bold text-sm tracking-widest uppercase">
                Seleccionar Responsable
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o DNI..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                  <th className="px-5 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Usuario</th>
                  <th className="px-5 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Nombre</th>
                  <th className="px-5 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Área</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-slate-400 text-sm italic">
                      No se encontraron usuarios activos
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr
                      key={u.usuario_usu}
                      onClick={() => onSelect(u)}
                      className="hover:bg-teal-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3 text-sm font-bold text-slate-700 group-hover:text-teal-700">
                        {u.usuario_usu}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {u.nomb_cort_usu || `${u.nom} ${u.ape}`}
                      </td>
                      <td className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-right">
                        {u.area_nombre || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {usuarios.length} usuario(s) encontrado(s)
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
