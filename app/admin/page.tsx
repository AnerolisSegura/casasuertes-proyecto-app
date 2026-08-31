'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Ticket {
  id: string;
  created_at: string;
  nombre_cliente: string;
  proyecto: string;
  apartamento: string;
  tipo_incidencia: string;
  descripcion: string;
  estado: string;
  fecha_proceso?: string | null;
  fecha_resuelto?: string | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identificacion, setIdentificacion] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const administradoresPermitidos = [
      { id: "402-3342901-4", pass: "Casasuertes2026*" },
      { id: "402-33429014-1", pass: "Casasuertes2026*" },
      { id: "AB123456", pass: "Ingenieria2026*" },
      { id: "admin", pass: "AdminMaster*" }
    ];

    const usuarioValido = administradoresPermitidos.find(
      (admin) => admin.id === identificacion.trim() && admin.pass === password
    );

    if (usuarioValido) {
      setIsAuthenticated(true);
      localStorage.setItem('casasuertes_admin_auth', 'true');
      fetchTickets();
    } else {
      setError('Identificación o contraseña incorrecta. Acceso denegado.');
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('casasuertes_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchTickets();
    }
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mantenimiento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoTicket = async (id: string, nuevoEstado: string) => {
    const ahora = new Date().toISOString();
    
    const updates: any = { estado: nuevoEstado, updated_at: ahora };
    if (nuevoEstado === 'En Proceso') updates.fecha_proceso = ahora;
    if (nuevoEstado === 'Resuelto') updates.fecha_resuelto = ahora;

    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === id ? { ...ticket, ...updates } : ticket
      )
    );

    try {
      const { error } = await supabase
        .from('mantenimiento')
        .update(updates)
        .eq('id', id);

      if (error) console.error("Error al actualizar en la base de datos:", error);
    } catch (err) {
      console.error("Error de red al actualizar:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('casasuertes_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 flex flex-col items-center">
          <div className="mb-6">
            <Image 
              src="/logo.png" 
              alt="Logo Casasuertes" 
              width={180} 
              height={50} 
              className="object-contain h-12 w-auto"
              priority
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">Acceso Ingenieros / Admin</h1>
          <p className="text-xs text-slate-500 mb-6 text-center">Ingresa tu Cédula, ID o Pasaporte autorizado y tu contraseña.</p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Identificación / Pasaporte
              </label>
              <input 
                type="text" 
                value={identificacion} 
                onChange={(e) => setIdentificacion(e.target.value)} 
                placeholder="Ej. 402-3342901-4" 
                required 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••••••" 
                required 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition text-sm mt-2"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 w-full text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-blue-600 transition font-medium">
              ← Volver al Portal Principal
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/70 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Image 
              src="/logo.png" 
              alt="Logo Casasuertes" 
              width={140} 
              height={40} 
              className="object-contain h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Panel de Control - Ingenieros y Mantenimiento</h1>
              <p className="text-xs text-slate-500 font-medium">Gestión de incidencias y trazabilidad horaria (CASASUERTES)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={fetchTickets}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              🔄 Actualizar Datos
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Trazabilidad de Tiempos</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Proyecto / Apto</th>
                  <th className="py-4 px-6">Incidencia</th>
                  <th className="py-4 px-6 text-center">Estado y Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">Cargando reportes...</td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No hay solicitudes registradas.</td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 text-xs text-slate-500 space-y-1">
                        <div><strong className="text-slate-700">Solicitud:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
                        {ticket.fecha_proceso && (
                          <div className="text-blue-600"><strong className="text-blue-700">A Proceso:</strong> {new Date(ticket.fecha_proceso).toLocaleString()}</div>
                        )}
                        {ticket.fecha_resuelto && (
                          <div className="text-emerald-600"><strong className="text-emerald-700">Resuelto:</strong> {new Date(ticket.fecha_resuelto).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{ticket.nombre_cliente}</td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-900 block">{ticket.proyecto}</span>
                        <span className="text-xs text-slate-400">Unidad: {ticket.apartamento}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800 block">{ticket.tipo_incidencia}</span>
                        <span className="text-xs text-slate-400 max-w-xs truncate block">{ticket.descripcion}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={ticket.estado}
                          onChange={(e) => actualizarEstadoTicket(ticket.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer focus:outline-none focus:ring-2 ${
                            ticket.estado === 'Pendiente'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500'
                              : ticket.estado === 'En Proceso'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500'
                          }`}
                        >
                          <option value="Pendiente">🟡 Pendiente</option>
                          <option value="En Proceso">🔵 En Proceso</option>
                          <option value="Resuelto">🟢 Resuelto</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}