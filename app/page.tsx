import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-6">
      <div className="w-full"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
        
        {/* Logo integrado correctamente */}
        <div className="mb-4">
          <Image 
            src="/logo.png" 
            alt="CASASUERTES SAS Logo" 
            width={170} 
            height={45} 
            className="object-contain h-12 w-auto"
            priority
          />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 mb-2">Portal de Propietarios</h1>
        <p className="text-slate-500 text-sm mb-6">Selecciona el servicio que deseas consultar:</p>
        
        <div className="flex flex-col gap-4 w-full">
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

      <footer className="text-center py-4">
        <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-600 transition">
          Acceso Administrador
        </Link>
      </footer>
    </main>
  );
}