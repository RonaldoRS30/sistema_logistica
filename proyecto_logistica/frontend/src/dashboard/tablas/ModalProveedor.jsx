import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, Trash2, Users, Tag, MapPin, Globe, Calendar, Image, Settings2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function ModalProveedor({ isOpen, onClose, onSuccess, proveedor }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!proveedor;

  const [formData, setFormData] = useState({
    codigo: "", nombre: "", iniciales: "", ruc: "", dir: "", tipo: "1",
    fpago: "", rub: "", pro: "", web: "", rleg: "", ubic: "",
    fecha: getTodayDate(), logo: "", activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (proveedor) {
        setFormData({
          codigo: proveedor.codigo || "",
          nombre: proveedor.nombre || "",
          iniciales: proveedor.iniciales || "",
          ruc: proveedor.ruc || "",
          dir: proveedor.dir || "",
          tipo: proveedor.tipo || "1",
          fpago: proveedor.fpago || "",
          rub: proveedor.rub || "",
          pro: proveedor.pro || "",
          web: proveedor.web || "",
          rleg: proveedor.rleg || "",
          ubic: proveedor.ubic || "",
          fecha: proveedor.fecha || getTodayDate(),
          logo: proveedor.logo || "",
          activo: normalizarBool(proveedor.activo),
        });
      } else {
        setFormData({
          codigo: "", nombre: "", iniciales: "", ruc: "", dir: "", tipo: "1",
          fpago: "", rub: "", pro: "", web: "", rleg: "", ubic: "",
          fecha: getTodayDate(), logo: "", activo: true,
        });
      }
    }
  }, [isOpen, proveedor]);

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
    if (!formData.nombre.trim()) {
      toast.error("El Nombre es requerido.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (isEditing) {
        await api.put(`/cotizaciones/clientes/${proveedor.codigo}/actualizar/`, payload);
        toast.success("Proveedor actualizado!");
      } else {
        await api.post(`/cotizaciones/clientes/crear/`, payload);
        toast.success("Proveedor registrado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar este proveedor de forma permanente?")) return;
    setLoading(true);
    try {
      await api.delete(`/cotizaciones/clientes/${proveedor.codigo}/eliminar/`);
      toast.success("Eliminado exitosamente!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("No se pudo eliminar el registro.");
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar Proveedor: ${formData.codigo}` : "Nuevo Proveedor"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                   Catálogo de Proveedores
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Sec: Identificación */}
            <div className="space-y-6">
              <SectionHeader icon={Tag} title="Identificación" />
              <div className="grid grid-cols-1 gap-4">
                 <FormItem 
                    label="Nombre / Razón Social" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    placeholder="Ej: CORPORACIÓN V&C S.A.C." 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem 
                      label="RUC" 
                      name="ruc" 
                      value={formData.ruc} 
                      onChange={handleChange} 
                      placeholder="20XXXXXXXXX" 
                    />
                    <FormItem 
                      label="Iniciales" 
                      name="iniciales" 
                      value={formData.iniciales} 
                      onChange={handleChange} 
                      placeholder="CVC" 
                    />
                  </div>
              </div>

              {/* Sec: Clasificación */}
              <SectionHeader icon={Settings2} title="Clasificación" className="pt-4" />
              <div className="grid grid-cols-1 gap-4">
                  <FormItem label="Tipo de Registro" name="tipo">
                      <select 
                        name="tipo" 
                        value={formData.tipo} 
                        onChange={handleChange}
                        className="w-full h-10 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      >
                         <option value="0">Cliente</option>
                         <option value="1">Proveedor</option>
                         <option value="01">Cliente / Proveedor</option>
                      </select>
                  </FormItem>
                  <FormItem label="Actividad / Giro" name="pro" value={formData.pro} onChange={handleChange} placeholder="Ej: Servicios de TI" />
                  <FormItem label="Rubro" name="rub" value={formData.rub} onChange={handleChange} placeholder="Ej: LOGISTICA" />
              </div>
            </div>

            {/* Sec: Contacto y Ubicación */}
            <div className="space-y-6">
               <SectionHeader icon={MapPin} title="Localización" />
               <div className="grid grid-cols-1 gap-4">
                  <FormItem label="Dirección Fiscal" name="dir" value={formData.dir} onChange={handleChange} placeholder="Ej: Av. Central 456" />
                  <FormItem label="Ubigeo / Ubicación" name="ubic" value={formData.ubic} onChange={handleChange} placeholder="Ej: Lima, Perú" />
                  <FormItem label="Página Web" name="web" value={formData.web} onChange={handleChange} placeholder="www.ejemplo.com">
                      <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </FormItem>
               </div>

               <SectionHeader icon={Calendar} title="Información Adicional" className="pt-4" />
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Fecha de Registro" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
                    <FormItem label="Forma de Pago" name="fpago" value={formData.fpago} onChange={handleChange} placeholder="Contado / Crédito" />
                  </div>
                  <FormItem label="Representante Legal" name="rleg" value={formData.rleg} onChange={handleChange} placeholder="Nombre completo" />
                  <FormItem label="Logo (Ruta)" name="logo" value={formData.logo} onChange={handleChange} placeholder="logo_empresa.png" />
               </div>
            </div>
            
            {/* Sec: Estado (Full Width) */}
            <div className="md:col-span-2 mt-4">
                <SectionHeader icon={Settings2} title="Estado del Registro" />
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner">
                   <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        id="prov_activo_chk"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 transition-all cursor-pointer shadow-sm"
                       />
                       <label htmlFor="prov_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">
                         ¿El Proveedor está activo actualmente?
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
              {isEditing ? "Guardar Cambios" : "Registrar Proveedor"}
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
