'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AvanceObra() {
  const [obras, setObras] = useState<any[]>([]);

  useEffect(() => {
    async function cargarAvances() {
      const { data } = await supabase.from('avance_obra').select('*');
      if (data) setObras(data);
    }
    cargarAvances();
  }, []);

  // Función auxiliar para convertir el texto de imágenes en un arreglo limpio
  const obtenerImagenes = (urlTexto: string) => {
    if (!urlTexto) return [];
    // Separa las URLs por comas o saltos de línea y limpia los espacios en blanco
    return urlTexto.split(/[\n,]+/).map((img) => img.trim()).filter(Boolean);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-200 pb-4">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">CASASUERTES S.A.S.</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Bitácora de Avance de Obra</h1>
          <p className="text-slate-500 text-sm mt-1">Monitoreo y transparencia en tiempo real para nuestros propietarios.</p>
        </header>

        <div className="grid gap-6">
          {obras.map((obra) => {
            const imagenes = obtenerImagenes(obra.imagen_url);

            return (
              <div key={obra.id} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 transition hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{obra.proyecto}</h2>
                    <p className="text-sm font-medium text-slate-600">Apartamento {obra.apartamento}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                    En Proceso
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  <span className="font-semibold text-slate-700">Fase actual:</span> {obra.fase_actual}
                </p>
                
                {/* Sección de Galería de Imágenes Múltiples */}
                {imagenes.length > 0 ? (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {imagenes.map((url, index) => (
                      <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 h-48">
                        <img src={url} alt={`Avance ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                    Fotografías de avance en proceso de actualización por el ingeniero de obra.
                  </div>
                )}

                {/* Barra de Progreso */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700">Progreso General</span>
                  <span className="text-sm font-extrabold text-blue-600">{obra.porcentaje}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${obra.porcentaje}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}