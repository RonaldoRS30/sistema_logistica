import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, LogOut, FileText, Tag, Hash, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const normalizarBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  return Boolean(v);
};

export default function ModalDocAlmacen({ isOpen, onClose, onSuccess, documento }) {
  const [loading, setLoading]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const isEditing = !!documento;

  const emptyForm = { cod: "", nom: "", activo: true };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (documento) {
        setFormData({
          cod:    documento.cod    || "",
          nom:    documento.nom    || "",
          activo: normalizarBool(documento.activo),
        });
      } else {
        setFormData(emptyForm);
      }
      setConfirmDel(false);
    }
  }, [isOpen, documento]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.cod.trim()) { toast.error("El Código es requerido."); return; }
    if (!formData.nom.trim()) { toast.error("El Nombre es requerido."); return; }

    setLoading(true);
    try {
      const payload = { ...formData, activo: formData.activo ? "1" : "0" };
      if (isEditing) {
        await api.put(`/cotizaciones/doc-almacen/${documento.cod}/actualizar/`, payload);
        toast.success("Documento actualizado.");
      } else {
        await api.post("/cotizaciones/doc-almacen/crear/", payload);
        toast.success("Documento registrado.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.error || "Error al guardar.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await api.delete(`/cotizaciones/doc-almacen/${documento.cod}/eliminar/`);
      toast.success("Documento eliminado.");
      onSuccess();
      onClose();
    } catch {
      toast.error("Error al eliminar.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
          {/* ── Header ── */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <FileText size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-black text-sm tracking-widest uppercase">
                  {isEditing ? `Editar: ${formData.cod}` : "Nuevo Documento de Almacén"}
                </h2>
                <span className="text-blue-400/70 text-[9px] font-bold tracking-tighter uppercase">
                  Tipos de Movimiento
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-8 bg-white space-y-6">
            <SectionHeader icon={Tag} title="Datos del Documento" />

            <div className="grid gap-4">
              {/* Código */}
              <FormItem
                label="Código"
                name="cod"
                value={formData.cod}
                onChange={handleChange}
                placeholder="Ej: 01"
                readOnly={isEditing}
                icon={<Hash size={14} className="text-slate-300" />}
              />

              {/* Nombre */}
              <FormItem
                label="Nombre / Descripción"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ej: Orden de Compra"
              />
            </div>

            {/* Estado activo */}
            <div>
              <SectionHeader icon={Settings2} title="Estado" />
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="doc_activo_chk"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="doc_activo_chk" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">
                    ¿Documento activo actualmente?
                  </label>
                </div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${formData.activo ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
                  {formData.activo ? "Operativo" : "Inactivo"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
            {/* Eliminar */}
            <div>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm
                    ${confirmDel
                      ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20 shadow-lg"
                      : "bg-white border border-rose-300 text-rose-600 hover:bg-rose-50"
                    }`}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {confirmDel ? "¿Confirmar?" : "Eliminar"}
                </button>
              )}
            </div>

            {/* Salir + Guardar */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEditing ? "Guardar Cambios" : "Crear Documento"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Sub-componentes ──────────────────────────────────────────
function FormItem({ label, name, value, onChange, placeholder = "", readOnly = false, icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
      <div className="relative group">
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full h-11 px-4 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all placeholder:text-slate-300 font-bold
            focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50
            ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-100 font-mono" : "group-hover:border-slate-300"}`}
        />
        {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
      <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white shadow-sm">
        <Icon size={14} />
      </div>
      <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</span>
    </div>
  );
}
