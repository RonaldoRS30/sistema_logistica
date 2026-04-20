import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, Trash2, PackageSearch, Tag, Layers, BadgeDollarSign, Settings2, Boxes, Info } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function ModalProducto({ isOpen, onClose, onSuccess, articulo }) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!articulo;

  const [grupos, setGrupos] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [formData, setFormData] = useState({
    reg: "", cod: "", nom: "", gru: "000", um: "", det: "",
    sol: "0.00", dol: "0.00", can: "0", min: "0", max: "0",
    dct: "0.00", pro: "", est: "", obs: "", ocod: "", activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchAuxiliares();
      if (articulo) {
        setFormData({
          reg: articulo.reg || "",
          cod: articulo.cod || "",
          nom: articulo.nom || "",
          gru: articulo.gru || "000",
          um: articulo.um || "",
          det: articulo.det || "",
          sol: articulo.sol || "0.00",
          dol: articulo.dol || "0.00",
          can: articulo.can || "0",
          min: articulo.min || "0",
          max: articulo.max || "0",
          dct: articulo.dct || "0.00",
          pro: articulo.pro || "",
          est: articulo.est || "",
          obs: articulo.obs || "",
          ocod: articulo.ocod || "",
          activo: normalizarBool(articulo.activo),
        });
      } else {
        setFormData({
            reg: "", cod: "", nom: "", gru: "000", um: "", det: "",
            sol: "0.00", dol: "0.00", can: "0", min: "0", max: "0",
            dct: "0.00", pro: "", est: "", obs: "", ocod: "", activo: true,
        });
      }
    }
  }, [isOpen, articulo]);

  const fetchAuxiliares = async () => {
    try {
      const [resGrupos, resUnidades] = await Promise.all([
        api.get("/cotizaciones/grupos-analiticos/"),
        api.get("/cotizaciones/unidades-medida/"),
      ]);
      setGrupos(Array.isArray(resGrupos.data) ? resGrupos.data : (resGrupos.data?.results || []));
      setUnidades(Array.isArray(resUnidades.data) ? resUnidades.data : (resUnidades.data?.results || []));
    } catch (e) {
      console.error("Error cargando auxiliares:", e);
    }
  };

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
      toast.error("El Nombre es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, activo: formData.activo ? "1" : "0" };
      if (isEditing) {
        await api.put(`/cotizaciones/productos/${articulo.reg}/actualizar/`, payload);
        toast.success("Producto actualizado!");
      } else {
        await api.post(`/cotizaciones/productos/crear/`, payload);
        toast.success("Producto registrado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al guardar producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar definitivamente?")) return;
    setLoading(true);
    try {
      await api.delete(`/cotizaciones/productos/${articulo.reg}/eliminar/`);
      toast.success("Eliminado exitosamente!");
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <PackageSearch size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar Producto` : "Nuevo Producto Almacén"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                   {isEditing ? `ID Registro: ${formData.reg}` : "Catálogo Maestro de Logística"}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Sección: Identificación */}
            <div className="space-y-6">
               <SectionHeader icon={Tag} title="Identificación de Producto" />
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Código de Artículo" name="cod" value={formData.cod} onChange={handleChange} placeholder="Ej: 100S-D140..." />
                    <FormItem label="Registro Sistema" name="reg" value={formData.reg} readOnly placeholder="Autogenerado" />
                  </div>
                  <FormItem label="Nombre / Descripción Alternativa" name="nom" value={formData.nom} onChange={handleChange} placeholder="Descripción completa..." />
                  <FormItem label="Modelo / Detalle Específico" name="ocod" value={formData.ocod} onChange={handleChange} placeholder="Ej: Part Number / Modelo..." />
               </div>

               <SectionHeader icon={Layers} title="Clasificación & Unidad" className="pt-4" />
               <div className="grid grid-cols-1 gap-4">
                  <FormItem label="Grupo Analítico">
                    <select
                        name="gru"
                        value={formData.gru}
                        onChange={handleChange}
                        className="w-full h-11 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                    >
                        <option value="000">-- Sin Grupo --</option>
                        {grupos.map(g => <option key={g.cod} value={g.cod}>{g.nom}</option>)}
                    </select>
                  </FormItem>
                  <div className="grid grid-cols-2 gap-4">
                     <FormItem label="Unidad de Medida" name="um">
                        <select
                            name="um"
                            value={formData.um}
                            onChange={handleChange}
                            className="w-full h-11 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                        >
                            <option value="">-- Seleccionar --</option>
                            {unidades.map(u => <option key={u.cod} value={u.cod}>{u.nom} ({u.cod})</option>)}
                        </select>
                     </FormItem>
                     <FormItem label="Marca / Fabr." name="det" value={formData.det} onChange={handleChange} placeholder="Allen Bradley..." />
                  </div>
               </div>
            </div>

            {/* Sección: Inventario y Finanzas */}
            <div className="space-y-6">
               <SectionHeader icon={BadgeDollarSign} title="Costos e Inventario" />
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Costo Unit. (S/)" name="sol" value={formData.sol} onChange={handleChange} type="number" />
                    <FormItem label="Costo Unit. ($)" name="dol" value={formData.dol} onChange={handleChange} type="number" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                     <FormItem label="Stock Act." name="can" value={formData.can} onChange={handleChange} type="number" />
                     <FormItem label="S. Mín." name="min" value={formData.min} onChange={handleChange} type="number" />
                     <FormItem label="S. Máx." name="max" value={formData.max} onChange={handleChange} type="number" />
                  </div>
               </div>

               <SectionHeader icon={Info} title="Información Logística" className="pt-4" />
               <div className="grid grid-cols-1 gap-4">
                  <FormItem label="Estado Comercial" name="est" value={formData.est} onChange={handleChange} placeholder="Ej: Disponible, Descontinuado..." />
                  <FormItem label="Proveedor Preferente" name="pro" value={formData.pro} onChange={handleChange} placeholder="Razón Social..." />
                  <FormItem label="Notas / Observaciones" name="obs" value={formData.obs} onChange={handleChange} placeholder="..." />
               </div>
            </div>
            
            {/* Sec: Estado (Full Width) */}
            <div className="md:col-span-2 mt-4">
                <SectionHeader icon={Settings2} title="Visibilidad & Auditoría" />
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner transition-all hover:border-slate-300">
                   <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        id="prod_activo_chk"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 transition-all cursor-pointer shadow-sm"
                       />
                       <label htmlFor="prod_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">
                         ¿El Producto está habilitado para transacciones?
                       </label>
                   </div>
                   <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${formData.activo ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
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
              {isEditing ? "Actualizar Producto" : "Registrar Producto"}
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
