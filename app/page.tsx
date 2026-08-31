import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl max-w-md w-full p-8 text-center space-y-6">
        
        {/* Logo / Encabezado */}
        <div className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Casasuertes Logo" 
            className="w-80 h-20 object-contain mb-3" 
          />
    
          <p className="text-sm text-slate-500 mt-1">Selecciona el módulo al que deseas ingresar.</p>
        </div>

        {/* Botones de Navegación Principal */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/mantenimiento"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 text-center block"
          >
            Módulo de Mantenimiento (Crear Reporte)
          </Link>

          <Link 
            href="/cliente"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 text-center block"
          >
            Portal del Cliente (Consultar Estado)
          </Link>

          <Link 
            href="/avance"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-slate-900/20 text-center block"
          >
            Bitácora (Ver Avances y Progreso)
          </Link>
        </div>

      </div>
    </main>
  );
}