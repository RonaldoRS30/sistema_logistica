import React, { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ClipboardList, 
  Truck, 
  MapPin, 
  Trash2, 
  Plus, 
  Save, 
  Printer, 
  Barcode,
  X 
} from "lucide-react";

export default function NuevaLogisticaModal({ open, onClose, dataInitial = null, logistica }) {
  const [data, setData] = useState(logistica || {});
  const cab = data?.cabecera || {};
  const [loading, setLoading] = useState(false);
  // --- Estados de Cabecera ---
  const [form, setForm] = useState({
    fecha: "30/12/2025",
    almacen: "Almacen Principal",
    tipoMov: "Orden de Compra",
    numero: "251096A-PREC-01",
    moneda: "",
    tc: "3.455",
    referencia: "20100617332",
    razonSocial: "RINTI S.A.",
    documentos: "T001-137",
    puntoPartida: "Manuel Alejandro Wiesse Milla",
    puntoLlegada: "ENVIAR A RINTI",
  });

  // --- Estados de Detalle (Tabla) ---
  const [items, setItems] = useState([]);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // Calcular Total General
  const totalGeneral = items.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulación de API
      // await api.post("logistica/salida-almacen/", { ...form, items });
      toast.success("Salida de almacén guardada correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al procesar el registro");
    } finally {
      setSaving(false);
    }
  };

  // =======
  // NUMREG
  // ========
  const numReg = logistica?.num_reg;

  const fetchLogisticaDetalle = async (num_reg) => {
    if (!num_reg) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`logistica/dashboard/modal/${num_reg}/`);
      const backendData = res.data;

      // 🔹 Guardar estructura completa
      setData(backendData);

      console.log("📦 MOVIMIENTO LOGÍSTICO RAW:", backendData);

      // ==============================
      // 🔥 HIDRATAR CABECERA (según backend)
      // ==============================
      const cab = backendData.cabecera || {};

      const tc = Number(cab.tipocambio || 0);

      const formHidratado = {
        fecha: cab.fecha || "",
        almacen: cab.almacen || "",
        referencia: cab.referencia || "",
        numero: cab.numero || "",
        moneda: cab.moneda === "D" ? "Dolares" : "Soles", // backend: moneda (D/S)
        tc: tc,
        referencia: cab.proveedorcodigo || "",
        responsable: cab.responsable || "",
        obsdoc: cab.obsdoc || "",
        documentos: cab.numerodoc || "",
        puntoPartida: cab.observacion || "",
        puntoLlegada: "",
      };

      setForm(formHidratado);

      console.log("🧾 CABECERA HIDRATADA:", formHidratado);
      console.log("💱 TC:", tc);

      // ==============================
      // 🔥 HIDRATAR ITEMS (según backend)
      // ==============================
      const mappedItems = (backendData.items || []).map((item, index) => ({
        id: index + 1,
        codigo: item.codigo || "",
        descripcion: item.nombre || "",
        um: item.unidad || "",
        cant: Number(item.cantidad || 0),
        valor: Number(item.valorunitario || 0), // backend: valorunitario
        total: Number(item.total || 0),
      }));

      setItems(mappedItems);

      console.log("📦 ITEMS HIDRATADOS:", mappedItems);

    } catch (err) {
      console.error("Error cargando detalle logístico:", err);
      setError("No se pudo cargar la información del movimiento.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (open && logistica?.num_reg) {
      fetchLogisticaDetalle(logistica.num_reg);
    }
  }, [open, logistica]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white rounded-2xl shadow-2xl border-none p-0 overflow-hidden font-sans">
        
        {/* HEADER ESTILO SISTEMA GESTIÓN */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Nueva Salida de Almacén
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Gestión de Inventarios y Traslados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
               <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                 ID: {data?.num_reg || "-"}
               </span>
            </div>
          </div>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <div className="p-4 space-y-4 max-height-[80vh] overflow-y-auto bg-slate-50/30">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="grid grid-cols-12 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="col-span-12 flex items-center gap-2 mb-2">
              <ClipboardList size={14} className="text-amber-600" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Información de Cabecera</span>
            </div>

            {/* Fila 1 */}
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fecha Registro</label>
              <input
                  type="text"
                  name="fecha"
                  value={form.fecha || ""}
                  readOnly
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none"
                />
            </div>
              <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Almacen</label>
                <select
                  name="almacen"
                  value={form.almacen || ""}
                  onChange={handleInputChange}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                >
                  <option value={form.almacen || ""}>{form.almacen || "-"}</option>
                </select>
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Moneda</label>
           <select
              name="moneda"
              value={form.moneda || ""}
              onChange={handleInputChange}
              className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
            >
              <option value="Soles">Soles</option>
              <option value="Dolares">Dolares</option>
            </select>
            </div>

            {/* Fila 2 */}
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tipo Movimiento</label>
               <select
                name="tipoMov"
                value={form.referencia || ""}
                onChange={handleInputChange}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                >
                <option value={form.referencia || ""}>{form.referencia || "-"}</option>
              </select>
            </div>
            <div className="col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Número Referencia</label>
              <div className="flex gap-2">
                <input type="text" value={data?.oco} className="w-1/3 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none" />
              </div>
            </div>
             <div className="col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1"> Razón Social</label>
              <div className="flex gap-2">
                <input type="text" value={data?.dor} className="flex-1 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none" />
              </div>
            </div>
         
          </div>

          {/* SECCIÓN 2: TRASLADO */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-amber-500">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <Truck size={14} className="text-amber-600" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Documentos</span>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nro. Factura</label>
                  <input type="text" value={data?.nfa} className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none" />
                </div>
                <div className="col-span-9 space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Recibido por</label>
                   <input type="text" value={data?.nom1} className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none" />
                </div>
                <div className="col-span-6 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/>Nro. de Guía</label>
                  <input type="text" value={data?.ngu} className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none" />
                </div>
                <div className="col-span-6 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/> Observación</label>
                  <input type="text" value={data?.nom2} className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none" />
                </div>
              </div>
          </div>

          {/* SECCIÓN 3: TABLA DE PRODUCTOS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-12 text-center">Nro</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-32">Código</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-16 text-center">UM</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-16 text-center">Cant</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-24 text-right">Valor</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-24 text-right">Total</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-2 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-2 text-xs font-bold text-slate-700">
                      {item.codigo}
                    </td>

                    <td className="px-4 py-2 text-xs font-medium text-slate-600 uppercase">
                      {item.descripcion}
                    </td>

                    <td className="px-4 py-2 text-center text-[10px] font-black text-slate-500">
                      {item.um}
                    </td>

                    <td className="px-4 py-2 text-center text-xs font-bold text-slate-700">
                      {item.cant}
                    </td>

                    <td className="px-4 py-2 text-right text-xs font-bold text-slate-700">
                      {item.valor.toFixed(2)}
                    </td>

                    <td className="px-4 py-2 text-right text-xs font-black text-slate-800">
                      {item.total.toFixed(2)}
                    </td>

                    <td className="px-4 py-2 text-center">
                      <button className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-100">
                  <td colSpan={6} className="px-4 py-3 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Total General:</td>
                  <td className="px-4 py-3 text-right text-sm font-black text-amber-600">{totalGeneral.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-black uppercase shadow-sm">
              <Printer size={16} /> Imprimir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-black uppercase shadow-sm">
              <Barcode size={16} /> Etiquetas
            </button>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="ghost" 
              onClick={onClose}
              className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-xl h-10 px-8 transition-all"
            >
              Salir
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl h-10 px-10 shadow-lg shadow-amber-200 flex gap-2"
            >
              <Save size={18} />
              {saving ? "Procesando..." : "Guardar Salida"}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}