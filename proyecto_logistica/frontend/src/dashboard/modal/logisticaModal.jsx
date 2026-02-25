import React, { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import SelectField from "../../components/ui/SelectField";
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

export default function LogisticaModal({ open, onClose, dataInitial = null, logistica }) {

  const [data, setData] = useState(logistica || {});
  const cab = data?.cabecera || {};
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // NUEVO ITEM (fila de búsqueda)
  // ================================
  const [newItem, setNewItem] = useState({
    codigo: "",
    descripcion: "",
    um: "",
    cant: "",
    valor: "",
  });

  // Calcular Total General
  const totalGeneral = items.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewItem = () => {
    if (!newItem.codigo && !newItem.descripcion) return;
    const cant  = Number(newItem.cant  || 0);
    const valor = Number(newItem.valor || 0);
    setItems((prev) => [
      ...prev,
      {
        id:          Date.now(),
        codigo:      newItem.codigo,
        descripcion: newItem.descripcion,
        um:          newItem.um,
        cant:        cant,
        valor:       valor,
        total:       cant * valor,
      },
    ]);
    setNewItem({ codigo: "", descripcion: "", um: "", cant: "", valor: "" });
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // =====================
  // OPCIONES LOGISTICA
  // =====================
  const almacenesOptions = [
    { id: "000", nombre: "Almacen Principal" },
    { id: "001", nombre: "Almacen Equipos de Proteccion" },
    { id: "003", nombre: "ALMACEN DE EQUIPOS PARA VENTA" },
    { id: "004", nombre: "Movimientos Quellaveco" },
    { id: "005", nombre: "Para Ventas" },
    { id: "006", nombre: "ALMACEN PATRIMONIO" },
    { id: "007", nombre: "TEMPORAL" },
  ];

  const ReferenciaOptions = [
    { id: "P", nombre: "Proveedor/Cliente" },
    { id: "D", nombre: "Dependencia" },
    { id: "C", nombre: "Centro de Costo" },
    { id: "A", nombre: "Apertura" },
    { id: "O", nombre: "Otro" },
    { id: "DON", nombre: "Donacion" },
    { id: "U", nombre: "Colaborador" },
  ];

  const movimientoOptions = [
    { id: "01", nombre: "Orden de Compra" },
    { id: "02", nombre: "Orden de Servicio" },
    { id: "03", nombre: "O.C. /G. Internamiento" },
    { id: "04", nombre: "Pecosa" },
    { id: "05", nombre: "Nota de Entrada" },
    { id: "06", nombre: "Ingreso x devolucion" },
    { id: "07", nombre: "Ingreso x Donacion" },
    { id: "08", nombre: "Ingreso x Transferencia" },
    { id: "09", nombre: "Salida de Ajuste de Inventario" },
    { id: "10", nombre: "Salida x Transferencia" },
    { id: "11", nombre: "Salida por Perdida" },
    { id: "12", nombre: "Ingreso por Ajuste de Inventario" },
    { id: "13", nombre: "Orden de Requerimiento" },
    { id: "99", nombre: "Saldo Inicial" },
    { id: "14", nombre: "Préstamo para Ejecución de Servicio" },
    { id: "15", nombre: "Nota de Credito" },
    { id: "16", nombre: "Nota de Debito" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // await api.post("logistica/salida-almacen/", { ...form, items });
      toast.success("Salida de almacén guardada correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al procesar el registro");
    } finally {
      setSaving(false);
    }
  };

// ================================
// BUSCADOR DE PRODUCTOS
// ================================
const [openBuscador, setOpenBuscador]         = useState(false);
const [busquedaQuery, setBusquedaQuery]       = useState("");
const [productosLista, setProductosLista]     = useState([]);
const [loadingBuscador, setLoadingBuscador]   = useState(false);

const fetchProductos = async (query) => {
  // ✅ Quitamos la restricción de mínimo 2 caracteres
  setLoadingBuscador(true);
  try {
    const res = await api.get(`logistica/dashboard/productos/?q=${query}`);
    setProductosLista(res.data || []);
  } catch {
    setProductosLista([]);
  } finally {
    setLoadingBuscador(false);
  }
};



// Busca con debounce mientras escribe
useEffect(() => {
  const timer = setTimeout(() => {
    fetchProductos(busquedaQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [busquedaQuery]);

const handleSeleccionarProducto = (producto) => {
  setNewItem({
    codigo:      producto.codigo || "",
    descripcion: producto.nombre || "",
    um:          producto.unidad || "",
    cant:        "",
    valor:       producto.precio || "",
  });
  setOpenBuscador(false);
  setBusquedaQuery("");
  setProductosLista([]);
};

// ================================
// BUSCADOR DE USUARIOS / RESPONSABLE
// ================================
const [openUsuario, setOpenUsuario]       = useState(false);
const [usuarioQuery, setUsuarioQuery]     = useState("");
const [usuarioLista, setUsuarioLista]     = useState([]);
const [loadingUsuario, setLoadingUsuario] = useState(false);

const fetchUsuarios = async (q = "") => {
  setLoadingUsuario(true);
  try {
    const { data } = await api.get("usuarios-activos/", { params: { q } });
    setUsuarioLista(Array.isArray(data) ? data : []);
  } catch {
    setUsuarioLista([]);
  } finally {
    setLoadingUsuario(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (openUsuario) fetchUsuarios(usuarioQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [usuarioQuery]);

const handleCloseUsuario = () => {
  setOpenUsuario(false);
  setUsuarioQuery("");
  setUsuarioLista([]);
};

const handleSeleccionarUsuario = (usuario) => {
  setForm((prev) => ({
    ...prev,
    responsable: usuario.nomb_cort_usu || usuario.usuario_usu,
  }));
  handleCloseUsuario();
};



// ================================
// BUSCADOR DE UNIDADES DE MEDIDA
// ================================
const [openUmed, setOpenUmed]           = useState(false);
const [umedQuery, setUmedQuery]         = useState("");
const [umedLista, setUmedLista]         = useState([]);
const [loadingUmed, setLoadingUmed]     = useState(false);

const fetchUmed = async (query) => {
  setLoadingUmed(true);
  try {
    const res = await api.get(`logistica/dashboard/umed/?q=${query}`);
    setUmedLista(res.data || []);
  } catch {
    setUmedLista([]);
  } finally {
    setLoadingUmed(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (openUmed) fetchUmed(umedQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [umedQuery]);

const handleSeleccionarUmed = (umed) => {
  setNewItem((prev) => ({ ...prev, um: umed.abr || umed.codigo }));
  setOpenUmed(false);
  setUmedQuery("");
  setUmedLista([]);
};

// Función reutilizable para cerrar limpio
const handleCloseUmed = () => {
  setOpenUmed(false);
  setUmedQuery("");
  setUmedLista([]);
};



  // =======
  // NUMREG
  // ========
  const numReg = Number(logistica?.num_reg) || null;

  const fetchLogisticaDetalle = async (num_reg) => {
    if (!num_reg) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`logistica/dashboard/modal/${num_reg}/`);
      const backendData = res.data;

      setData(backendData);

      console.log("📦 MOVIMIENTO LOGÍSTICO RAW:", backendData);

      // ==============================
      // 🔥 HIDRATAR CABECERA
      // ==============================
      const cab = backendData.cabecera || {};
      const tc = Number(cab.tipo_cambio || 0);

      const formHidratado = {
        fecha:           cab.fecha           || "",
        almacen:         cab.almacen         || "",
        referencia:      cab.referencia      || "",
        numero:          cab.numero          || "",
        moneda:          cab.moneda === "D" ? "Dolares" : "Soles",
        tc:              tc,
        responsable:     cab.responsable     || "",
        tipo_movimiento: cab.tipo_movimiento || "",
        orden_compra:    cab.orden_compra    || "",
        razon_social:    cab.razon_social    || "",
        numero_doc:      cab.numero_doc      || "",
        obsdoc:          cab.obsdoc          || "",
        documentos:      cab.numerodoc       || "",
        puntoPartida:    cab.observacion     || "",
        puntoLlegada:    "",
        nro_guia:        cab.nro_guia        || "",
        obs_doc:         cab.obs_doc         || "",
      };

      setForm(formHidratado);

      console.log("🧾 CABECERA HIDRATADA:", formHidratado);
      console.log("💱 TC:", tc);

      // ==============================
      // 🔥 HIDRATAR ITEMS
      // ==============================
      const mappedItems = (backendData.items || []).map((item, index) => ({
        id:          index + 1,
        codigo:      item.codigo         || "",
        descripcion: item.nombre         || "",
        um:          item.unidad         || "",
        cant:        Number(item.cantidad       || 0),
        valor:       Number(item.valor_unitario || 0),
        total:       Number(item.total          || 0),
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
    if (!open) {
      setForm({});
      setItems([]);
      setData({});
      return;
    }
    if (logistica?.num_reg) {
      fetchLogisticaDetalle(logistica.num_reg);
    }
  }, [open, logistica?.num_reg]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="
        w-[95vw] sm:w-auto
        max-w-5xl
        max-h-[90vh]
        p-0
        overflow-hidden
        bg-white
        rounded-2xl
        shadow-2xl
        border-none
        font-sans
        flex flex-col
      ">

        {/* HEADER */}
        <div className="shrink-0 bg-slate-900 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 text-white rounded-lg">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Entrada de Almacén
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Gestión de Inventarios y Traslados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                ID: {form.numero || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">

          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="grid grid-cols-12 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="col-span-12 flex items-center gap-2 mb-2">
              <ClipboardList size={14} className="text-teal-600" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Información de Cabecera</span>
            </div>

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
              <SelectField
                id="almacen"
                inline
                size="sm"
                value={form.almacen || ""}
                onChange={(e) => handleInputChange({ target: { name: "almacen", value: e.target.value } })}
                options={almacenesOptions}
              />
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

            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Referencia</label>
              <SelectField
                id="mov"
                inline
                size="sm"
                value={form.referencia || ""}
                onChange={(e) => handleInputChange({ target: { name: "referencia", value: e.target.value } })}
                options={ReferenciaOptions}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tipo movimiento</label>
              <SelectField
                id="tip"
                inline
                size="sm"
                value={form.tipo_movimiento || ""}
                onChange={(e) => handleInputChange({ target: { name: "tipo_movimiento", value: e.target.value } })}
                options={movimientoOptions}
              />
            </div>
            <div className="col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Número</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.orden_compra || ""}
                  onChange={(e) => setForm({ ...form, orden_compra: e.target.value })}
                  className="w-1/3 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
            <div className="col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Razón Social</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.razon_social || ""}
                  readOnly
                  className="flex-1 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DOCUMENTOS */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-teal-500">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Truck size={14} className="text-teal-600" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Documentos</span>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nro. Factura</label>
                <input
                  type="text"
                  value={form.numero_doc || ""}
                  onChange={(e) => setForm({ ...form, numero_doc: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
            <div className="col-span-9 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Recibido por</label>
                <button
                  onClick={() => {
                    setUsuarioQuery("");
                    setUsuarioLista([]);
                    fetchUsuarios("");
                    setOpenUsuario(true);
                  }}
                  className="w-full text-left text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 
                            bg-white hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700 
                            transition-colors outline-none cursor-pointer"
                  title="Seleccionar responsable"
                >
                  {form.responsable
                    ? <span className="text-slate-700">{form.responsable}</span>
                    : <span className="text-slate-400">Seleccionar usuario...</span>
                  }
                </button>
              </div>

              <div className="col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                  <MapPin size={10} /> Nro. de Guía
                </label>
                <input
                  type="text"
                  value={form.nro_guia || ""}
                  onChange={(e) => setForm({ ...form, nro_guia: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
              <div className="col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                  <MapPin size={10} /> Observación
                </label>
                <input
                  type="text"
                  value={form.obs_doc || ""}
                  onChange={(e) => setForm({ ...form, obs_doc: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: TABLA DE PRODUCTOS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>

                {/* HEADERS */}
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

                {/* FILA DE BÚSQUEDA */}
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <td className="px-4 py-2 text-center">
                    <span className="text-[10px] text-slate-400 font-black">»</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                           <button
                          onClick={() => {
                            setBusquedaQuery("");        // limpia el input
                            fetchProductos("");          // carga todos por defecto
                            setOpenBuscador(true);
                          }}
                          className="shrink-0 px-1.5 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded text-[10px] font-black transition-colors"
                          title="Buscar producto"
                        >
                          »
                        </button>
                      <input
                        type="text"
                        placeholder="Código"
                        value={newItem.codigo}
                        onChange={(e) => handleNewItemChange("codigo", e.target.value)}
                        className="w-full text-[11px] font-bold border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Descripción del producto"
                      value={newItem.descripcion}
                      onChange={(e) => handleNewItemChange("descripcion", e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white uppercase"
                    />
                  </td>
                    <td className="px-2 py-2">
                     <button
                        onClick={() => {
                          setUmedQuery("");           // limpia el input
                          setUmedLista([]);           // limpia resultados anteriores
                          fetchUmed("");              // carga todas por defecto
                          setOpenUmed(true);
                        }}
                        className="w-full text-[11px] font-black text-center border border-slate-300 rounded px-1 py-1 
                                  bg-white hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700 
                                  transition-colors outline-none cursor-pointer"
                        title="Seleccionar unidad de medida"
                      >
                        {newItem.um || <span className="text-slate-400">UM</span>}
                      </button>
                    </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={newItem.cant}
                      onChange={(e) => handleNewItemChange("cant", e.target.value)}
                      className="w-full text-[11px] font-bold text-center border border-slate-300 rounded px-1 py-1 outline-none focus:border-teal-400 bg-white"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newItem.valor}
                      onChange={(e) => handleNewItemChange("valor", e.target.value)}
                      className="w-full text-[11px] font-bold text-right border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-[11px] font-black text-slate-500">
                    {(Number(newItem.cant || 0) * Number(newItem.valor || 0)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={handleAddNewItem}
                      className="p-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors shadow-sm"
                      title="Agregar ítem"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </td>
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
                      {Number(item.valor).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-black text-slate-800">
                      {Number(item.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-[11px] text-slate-400 font-semibold">
                      Sin ítems. Completa la fila superior y presiona{" "}
                      <span className="text-teal-500 font-black">+</span>.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-100">
                  <td colSpan={6} className="px-4 py-3 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Total General:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-amber-600">
                    {totalGeneral.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

        {/* FOOTER */}
        <div className="shrink-0 px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
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
              className="bg-teal-600 hover:bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl h-10 px-10 shadow-lg shadow-teal-200 flex gap-2"
            >
              <Save size={18} />
              {saving ? "Procesando..." : "Guardar Salida"}
            </Button>
          </div>
        </div>

{/* ===== MODAL BUSCADOR DE PRODUCTOS ===== */}
{openBuscador && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setOpenBuscador(false)}
    />

    {/* Contenido */}
    <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[520px] max-h-[480px] flex flex-col overflow-hidden border border-slate-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-600 rounded">
            <Package size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-wider">
            Seleccionar Dato
          </span>
        </div>
        <button
          onClick={() => setOpenBuscador(false)}
          className="p-1 text-slate-400 hover:text-white transition-colors rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Buscador */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Buscar por código o nombre..."
            value={busquedaQuery}
            onChange={(e) => setBusquedaQuery(e.target.value)}
            className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
          />
          <button
            onClick={() => fetchProductos(busquedaQuery)}
            className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            {loadingBuscador
              ? <span className="text-[10px] font-black">...</span>
              : <span className="text-[12px]">🔍</span>
            }
          </button>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-36">Código</th>
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productosLista.length === 0 && !loadingBuscador && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                  {busquedaQuery.length < 2
                    ? "Escribe al menos 2 caracteres para buscar"
                    : "No se encontraron productos"}
                </td>
              </tr>
            )}
            {loadingBuscador && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                  Buscando...
                </td>
              </tr>
            )}
            {!loadingBuscador && productosLista.map((producto, idx) => (
              <tr
                key={idx}
                onClick={() => handleSeleccionarProducto(producto)}
                className="hover:bg-teal-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                  {producto.codigo}
                </td>
                <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                  {producto.nombre}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con contador */}
      <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] text-slate-400 font-semibold">
          {productosLista.length > 0
            ? `${productosLista.length} resultado(s) encontrado(s)`
            : "Sin resultados"}
        </span>
      </div>

    </div>
  </div>
)}
{/* ===== FIN MODAL BUSCADOR ===== */}

{/* ===== MODAL BUSCADOR DE UNIDAD DE MEDIDA ===== */}
{openUmed && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">

    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={handleCloseUmed}
    />

    {/* Contenido */}
    <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[400px] max-h-[420px] flex flex-col overflow-hidden border border-slate-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-600 rounded">
            <Package size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-wider">
            Unidad de Medida
          </span>
        </div>
        <button
          onClick={handleCloseUmed}
          className="p-1 text-slate-400 hover:text-white transition-colors rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Buscador */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Buscar por código o nombre..."
            value={umedQuery}
            onChange={(e) => setUmedQuery(e.target.value)}
            className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
          />
          <button
            onClick={() => fetchUmed(umedQuery)}
            className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            {loadingUmed
              ? <span className="text-[10px] font-black">...</span>
              : <span className="text-[12px]">🔍</span>
            }
          </button>
        </div>
      </div>

      {/* Tabla resultados */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-24">Código</th>
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-20 text-center">Abrev.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {umedLista.length === 0 && !loadingUmed && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                  No se encontraron unidades
                </td>
              </tr>
            )}
            {loadingUmed && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                  Buscando...
                </td>
              </tr>
            )}
            {!loadingUmed && umedLista.map((umed, idx) => (
              <tr
                key={idx}
                onClick={() => handleSeleccionarUmed(umed)}
                className="hover:bg-teal-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                  {umed.codigo}
                </td>
                <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                  {umed.nombre}
                </td>
                <td className="px-4 py-2.5 text-[11px] font-black text-center text-slate-500 group-hover:text-teal-700">
                  {umed.abr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer contador */}
      <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] text-slate-400 font-semibold">
          {umedLista.length > 0
            ? `${umedLista.length} unidad(es) encontrada(s)`
            : "Sin resultados"}
        </span>
      </div>

    </div>
  </div>
)}
{/* ===== FIN MODAL UNIDAD DE MEDIDA ===== */}


{/* ===== MODAL BUSCADOR DE USUARIOS ===== */}
{openUsuario && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">

    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={handleCloseUsuario}
    />

    {/* Contenido */}
    <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[500px] max-h-[440px] flex flex-col overflow-hidden border border-slate-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-600 rounded">
            <Package size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-wider">
            Seleccionar Responsable
          </span>
        </div>
        <button
          onClick={handleCloseUsuario}
          className="p-1 text-slate-400 hover:text-white transition-colors rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Buscador */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Buscar por nombre, usuario o DNI..."
            value={usuarioQuery}
            onChange={(e) => setUsuarioQuery(e.target.value)}
            className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
          />
          <button
            onClick={() => fetchUsuarios(usuarioQuery)}
            className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            {loadingUsuario
              ? <span className="text-[10px] font-black">...</span>
              : <span className="text-[12px]">🔍</span>
            }
          </button>
        </div>
      </div>

      {/* Tabla resultados */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-28">Usuario</th>
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
              <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-24 text-center">Área</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">

            {loadingUsuario && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                  Buscando...
                </td>
              </tr>
            )}

            {!loadingUsuario && usuarioLista.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                  No se encontraron usuarios
                </td>
              </tr>
            )}

            {!loadingUsuario && usuarioLista.map((usuario, idx) => (
              <tr
                key={idx}
                onClick={() => handleSeleccionarUsuario(usuario)}
                className="hover:bg-teal-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                  {usuario.usuario_usu}
                </td>
                <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                  {usuario.nomb_cort_usu || `${usuario.nom || ""} ${usuario.ape || ""}`.trim()}
                </td>
               <td className="px-4 py-2.5 text-[11px] text-center font-semibold text-slate-500 group-hover:text-teal-700">
                  {usuario.area_nombre || "-"}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] text-slate-400 font-semibold">
          {usuarioLista.length > 0
            ? `${usuarioLista.length} usuario(s) encontrado(s)`
            : "Sin resultados"}
        </span>
      </div>

    </div>
  </div>
)}
{/* ===== FIN MODAL USUARIOS ===== */}


      </DialogContent>
    </Dialog>
  );
}
