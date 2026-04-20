import React from "react";
import { motion } from "framer-motion";

export default function TablasPlaceholder({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6"
    >
      <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Módulo en construcción. Aquí se mostrará el listado y sus acciones.
        </p>
      </div>
    </motion.div>
  );
}

