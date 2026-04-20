// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "@/styles/Home.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { AuthProvider } from "@/context/AuthContext.jsx";
import ProtectedRoute from "@/components/layout/ProtectedRoute.jsx";

// AUTH
import LoginPage from "@/auth/login/LoginPage.jsx";
import RegisterPage from "@/auth/register/RegisterPage.jsx";
import { Toaster } from "sonner";
// LAYOUT PRINCIPAL
import DashboardLayout from "@/dashboard/layout/DashboardLayout.jsx";
import GlobalNavbar from "@/dashboard/layout/GlobalNavbar.jsx";

// DASHBOARDS DE PRUEBA PARA COTIZACIONES
import EntradaAlmacen from "./dashboard/entrada/EntradaAlm.jsx";
import SalidaAlmacen from "./dashboard/salida/SalidaAlm.jsx";
import Cotizaciones from "./dashboard/cotizaciones/Cotizaciones.jsx";
import RevisionCotizaciones from "./dashboard/revision_cotizaciones/RevisionCotizaciones";
import SeguimientoCotizaciones from "@/dashboard/seguimiento_cotizaciones/SeguimientoCotizaciones.jsx";
import CotizacionesHome from "./dashboard/Home/CotizacionesHome";
import KardexDashboard from "./dashboard/kardexLogistica/kardexDashboard.jsx";
import TablasPlaceholder from "./dashboard/tablas/TablasPlaceholder.jsx";
import Proveedores from "./dashboard/tablas/Proveedores.jsx";
import Almacenes from "./dashboard/tablas/Almacenes.jsx";
import GrupoAnalitico from "./dashboard/tablas/GrupoAnalitico.jsx";
import Productos from "./dashboard/tablas/Productos.jsx";
import CentrosCosto from "./dashboard/tablas/CentrosCosto.jsx";
import UnidadesMedida from "./dashboard/tablas/UnidadesMedida.jsx";
import DocumentosAlmacen from "./dashboard/tablas/DocumentosAlmacen.jsx";
import ReportesTablasDashboard from "./dashboard/tablas/ReportesTablasDashboard.jsx";
import ReportesAlmacenDashboard from "./dashboard/reportes/ReportesAlmacenDashboard.jsx";




// MODAL NUEVA COTIZACIÓN
import CotizacionNuevaModal from "./dashboard/aprobacion_cotizacion/CotizacionNuevaModal";

import { KeyboardProvider } from "@/context/KeyboardContext.jsx";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <KeyboardProvider>

          <ToastContainer position="top-right" autoClose={3000} />
          <Toaster richColors position="top-right" />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Home */}
              <Route path="cotizaciones-home" element={<CotizacionesHome />} />

              {/* Entrada Almacén */}
              <Route path="entrada-almacen" element={<EntradaAlmacen />} />

              {/* Salida Almacén */}
              <Route path="salida-almacen" element={<SalidaAlmacen />} />

              {/* Kardex */}
              <Route path="kardex" element={<KardexDashboard />} />

              {/* Cotizaciones */}
              <Route path="cotizaciones" element={<Cotizaciones />} />

              {/* Revisión */}
              <Route
                path="revision-cotizacion"
                element={<RevisionCotizaciones />}
              />

              {/* Seguimiento */}
              <Route
                path="seguimiento-cotizaciones"
                element={<SeguimientoCotizaciones />}
              />

              {/* Nueva Cotización */}
              <Route
                path="cotizaciones/nueva"
                element={<CotizacionNuevaModal />}
              />

            {/* TABLAS (placeholders) */}
            <Route
              path="proveedores"
              element={<Proveedores />}
            />
            <Route
              path="almacenes"
              element={<Almacenes />}
            />
            <Route
              path="grupo-analitico"
              element={<GrupoAnalitico />}
            />
            <Route
              path="productos"
              element={<Productos />}
            />
            <Route
              path="centros-costo-almacen"
              element={<CentrosCosto />}
            />
            <Route
              path="umed"
              element={<UnidadesMedida />}
            />
            <Route
              path="documentos-almacen"
              element={<DocumentosAlmacen />}
            />
            
            {/* REPORTES Y CONSULTAS */}
            <Route
              path="reportes-tablas"
              element={<ReportesTablasDashboard />}
            />
            <Route
              path="reportes-almacen"
              element={<ReportesAlmacenDashboard />}
            />

            {/* Redirect */}
            <Route
              path="*"
              element={<Navigate to="/dashboard/entrada-almacen" replace />}
            />
            </Route>
            {/* Redirects para rutas desconocidas y la raíz del sitio */}
            <Route path="/" element={<Navigate to="/dashboard/entrada-almacen" replace />} />
            <Route path="*" element={<Navigate to="/dashboard/entrada-almacen" replace />} />
          </Routes>

        </KeyboardProvider>
      </AuthProvider>
    </Router>
  );
}
