import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, Database, Tag, Settings2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function ModalGrupoAnalitico({ isOpen, onClose, onSuccess, grupo }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!grupo;

  const [formData, setFormData] = useState({
    cod: "", nom: "", activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (grupo) {
        setFormData({
            cod: grupo.cod || "",
            nom: grupo.nom || "",
            activo: normalizarBool(grupo.activo),
        });
      } else {
        setFormData({
            cod: "", nom: "", activo: true,
        });
      }
    }
  }, [isOpen, grupo]);

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
    if (!formData.nom.trim()) {
      toast.error("El Nombre es requerido.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nom: formData.nom,
        activo: formData.activo ? "1" : "0",
      };

      if (isEditing) {
        payload.cod = formData.cod;
        await api.put(`/cotizaciones/grupos-analiticos/${grupo.cod}/actualizar/`, payload);
        toast.success("Grupo Analítico actualizado!");
      } else {
        await api.post(`/cotizaciones/grupos-analiticos/crear/`, payload);
        toast.success("Grupo Analítico registrado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al guardar registro.");
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
                <Database size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar Grupo: ${formData.cod}` : "Nuevo Grupo Analítico"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                   Parámetros del Sistema
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 bg-white space-y-8">
            {/* Sección: Datos */}
            <div className="space-y-6">
               <SectionHeader icon={Tag} title="Configuración del Grupo" />
               <div className="grid grid-cols-1 gap-5">
                  <FormItem 
                    label="Código Interno" 
                    name="cod" 
                    value={formData.cod} 
                    readOnly 
                    placeholder="Autogenerado por el sistema" 
                  />
                  <FormItem 
                    label="Nombre Comercial del Grupo" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleChange} 
                    placeholder="Ej: EQUIPOS DE PROTECCIÓN" 
                  />
               </div>
            </div>

            {/* Sec: Estado */}
            <div className="pt-2">
                <SectionHeader icon={Settings2} title="Disponibilidad" />
                <div className="p-5 mt-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner">
                   <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        id="grp_activo_chk"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 transition-all cursor-pointer shadow-sm"
                       />
                       <label htmlFor="grp_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">
                         ¿Grupo Analítico Activo?
                       </label>
                   </div>
                   <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${formData.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {formData.activo ? 'Vigente' : 'Inactivo'}
                   </div>
                </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 flex justify-center sm:justify-end gap-3 border-t border-slate-200">
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
              {isEditing ? "Guardar Cambios" : "Crear Grupo"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FormItem({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false, children }) {
    return (
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
        <div className="relative group">
          {children || (
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              readOnly={readOnly}
              placeholder={placeholder}
              className={`w-full h-11 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all placeholder:text-slate-300 font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-100 font-mono italic" : "group-hover:border-slate-300"}`}
            />
          )}
        </div>
      </div>
    );
  }
  
  function SectionHeader({ icon: Icon, title, className = "" }) {
    return (
      <div className={`flex items-center gap-2.5 pb-2 border-b border-slate-100 ${className}`}>
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white shadow-sm">
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</span>
      </div>
    );
  }
