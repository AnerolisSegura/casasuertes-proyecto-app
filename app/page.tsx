import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">CASASUERTES S.A.S.</span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-2">Portal de Propietarios</h1>
        <p className="text-slate-500 text-sm mb-6">Selecciona el servicio que deseas consultar:</p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/avance" 
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
             Bitácora de Avance de Obra
          </Link>
          
          <Link 
            href="/mantenimiento" 
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            Módulo de Mantenimiento
          </Link>
        </div>
      </div>
    </main>
  );
}