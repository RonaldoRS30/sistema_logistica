import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, Trash2, Warehouse, Tag, Settings2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function ModalCcosto({ isOpen, onClose, onSuccess, ccosto }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!ccosto;

  const [formData, setFormData] = useState({
    cod: "", nom: "", activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (ccosto) {
        setFormData({
            cod: ccosto.cod || "",
            nom: ccosto.nom || "",
            activo: normalizarBool(ccosto.activo),
        });
      } else {
        setFormData({ cod: "", nom: "", activo: true });
      }
    }
  }, [isOpen, ccosto]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.cod.trim() || !formData.nom.trim()) {
      toast.error("Código y Nombre son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, activo: formData.activo ? "1" : "0" };
      if (isEditing) {
        await api.put(`/cotizaciones/centros-costo/${ccosto.cod}/actualizar/`, payload);
        toast.success("Centro de costo actualizado!");
      } else {
        await api.post(`/cotizaciones/centros-costo/crear/`, payload);
        toast.success("Centro de costo registrado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar centro de costo.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar definitivamente este centro de costo?")) return;
    setLoading(true);
    try {
      await api.delete(`/cotizaciones/centros-costo/${ccosto.cod}/eliminar/`);
      toast.success("Eliminado exitosamente.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Warehouse size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar Centro de Costo` : "Nuevo Centro de Costo"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                   Gestión de Almacenes
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <SectionHeader icon={Tag} title="Datos Generales" />
                <div className="grid grid-cols-1 gap-4">
                  <FormItem 
                    label="Código (ID)" 
                    name="cod" 
                    value={formData.cod} 
                    onChange={handleChange} 
                    readOnly={isEditing}
                    placeholder="Ej: ADM, CONT, ALM..." 
                  />
                  <FormItem 
                    label="Nombre del Centro de Costo" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleChange} 
                    placeholder="Ej: Oficina de Contabilidad..." 
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <SectionHeader icon={Settings2} title="Estado Operativo" />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <input
                        type="checkbox"
                        id="cc_activo_chk"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 transition-all cursor-pointer"
                       />
                       <label htmlFor="cc_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-tight">
                         ¿Centro de Costo Habilitado?
                       </label>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.activo ? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200' : 'bg-rose-100 text-rose-700 shadow-sm shadow-rose-200'}`}>
                      {formData.activo ? 'Activo' : 'Inactivo'}
                   </div>
                </div>
              </motion.div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 flex justify-center sm:justify-end gap-3 border-t border-slate-200">
            {isEditing && (
                <button
                onClick={handleEliminar}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                <Trash2 className="w-4 h-4" />
                Eliminar
                </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FormItem({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false, children }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">{label}</label>
        <div className="relative group">
          {children || (
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              readOnly={readOnly}
              placeholder={placeholder}
              className={`w-full h-10 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-100 font-mono" : ""}`}
            />
          )}
        </div>
      </div>
    );
  }
  
  function SectionHeader({ icon: Icon, title }) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{title}</span>
      </div>
    );
  }
