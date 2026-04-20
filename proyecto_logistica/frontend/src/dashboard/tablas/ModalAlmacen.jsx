import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, Building2, Tag, User, Phone, MapPin, Settings2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import ModalSeleccionUsuario from "./ModalSeleccionUsuario";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function ModalAlmacen({ isOpen, onClose, onSuccess, almacen }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!almacen;
  const [openBusquedaUsuario, setOpenBusquedaUsuario] = useState(false);

  const [formData, setFormData] = useState({
    cod: "", nom: "", res: "", tel: "", dir: "", activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (almacen) {
        setFormData({
          cod: almacen.cod || "",
          nom: almacen.nom || "",
          res: almacen.res || "",
          tel: almacen.tel || "",
          dir: almacen.dir || "",
          activo: normalizarBool(almacen.activo),
        });
      } else {
        setFormData({
          cod: "", nom: "", res: "", tel: "", dir: "", activo: true,
        });
      }
    }
  }, [isOpen, almacen]);

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
      const payload = { ...formData, activo: formData.activo ? "1" : "0" };
      if (isEditing) {
        await api.put(`/cotizaciones/almacenes/${almacen.cod}/actualizar/`, payload);
        toast.success("Almacén actualizado!");
      } else {
        await api.post(`/cotizaciones/almacenes/crear/`, payload);
        toast.success("Almacén registrado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al guardar el almacén.");
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Building2 size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar Almacén: ${formData.cod}` : "Nuevo Almacén"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                   Gestión de Depósitos
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Sec: Datos del Almacén */}
            <div className="space-y-6">
               <SectionHeader icon={Tag} title="Información Base" />
               <div className="grid grid-cols-1 gap-4">
                  <FormItem 
                    label="Código de Almacén" 
                    name="cod" 
                    value={formData.cod} 
                    onChange={handleChange} 
                    placeholder="Ej: 001" 
                    readOnly={isEditing}
                  />
                  <FormItem 
                    label="Nombre Comercial" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleChange} 
                    placeholder="Ej: ALMACÉN CENTRAL" 
                  />
               </div>
            </div>

            {/* Sec: Contacto y Ubicación */}
            <div className="space-y-6">
               <SectionHeader icon={MapPin} title="Contacto y Ubicación" />
               <div className="grid grid-cols-1 gap-4">
                  <FormItem label="Responsable del Almacén" name="res">
                    <div className="relative group">
                        <input
                        type="text"
                        name="res"
                        value={formData.res}
                        onChange={handleChange}
                        placeholder="Buscar Usuario..."
                        className="w-full h-11 px-4 pr-12 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all placeholder:text-slate-300 font-bold focus:border-blue-500 focus:bg-white group-hover:border-slate-300"
                        />
                        <button
                        type="button"
                        onClick={() => setOpenBusquedaUsuario(true)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                        <Search size={16} />
                        </button>
                    </div>
                  </FormItem>
                  <FormItem label="Dirección / Calle / Nro" name="dir" value={formData.dir} onChange={handleChange} placeholder="Ej: Av. Industrial 123" />
                  <FormItem label="Teléfono de Contacto" name="tel" value={formData.tel} onChange={handleChange} placeholder="Ej: +51 987 654 321">
                      <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </FormItem>
               </div>
            </div>

            {/* Sec: Estado (Full Width) */}
            <div className="md:col-span-2 mt-4">
                <SectionHeader icon={Settings2} title="Disponibilidad" />
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner transition-all hover:border-slate-300">
                   <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        id="alm_activo_chk"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 transition-all cursor-pointer shadow-sm"
                       />
                       <label htmlFor="alm_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">
                         ¿El Almacén está operativo actualmente?
                       </label>
                   </div>
                   <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${formData.activo ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                      {formData.activo ? 'Operativo' : 'Fuera de Servicio'}
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
              {isEditing ? "Guardar Cambios" : "Crear Almacén"}
            </button>
          </div>
        </motion.div>

        <ModalSeleccionUsuario
          isOpen={openBusquedaUsuario}
          onClose={() => setOpenBusquedaUsuario(false)}
          onSelect={(u) => {
            setFormData((prev) => ({
              ...prev,
              res: u.nomb_cort_usu || u.usuario_usu,
            }));
            setOpenBusquedaUsuario(false);
          }}
        />
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
            className={`w-full h-11 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all placeholder:text-slate-300 font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-100 font-mono" : "group-hover:border-slate-300"}`}
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
