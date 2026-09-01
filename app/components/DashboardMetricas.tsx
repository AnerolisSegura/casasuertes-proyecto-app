'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend 
} from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardMetricas() {
  const [datosProyectos, setDatosProyectos] = useState([]);
  const [datosEncargados, setDatosEncargados] = useState([]);
  const [datosTiempos, setDatosTiempos] = useState([]);
  const [totalReportes, setTotalReportes] = useState(0);
  const [tiempoPromedio, setTiempoPromedio] = useState('0');
  const [efectividad, setEfectividad] = useState('0');

  const cargarDatos = async () => {
    const { data: tickets, error } = await supabase
      .from('tickets_mantenimiento')
      .select('*');

    if (error) {
      console.error('Error al obtener tickets de Supabase:', error);
      return;
    }

    if (!tickets || tickets.length === 0) {
      setDatosProyectos([]);
      setDatosEncargados([]);
      setDatosTiempos([]);
      setTotalReportes(0);
      setTiempoPromedio('0');
      setEfectividad('0');
      return;
    }

    setTotalReportes(tickets.length);

    const proyectosMap: { [key: string]: number } = {};
    const encargadosMap: { [key: string]: { asignados: number; resueltos: number } } = {};
    const tiemposMap: { [key: string]: { sumaDias: number; count: number } } = {};

    let totalDiasCierre = 0;
    let ticketsCerradosCount = 0;
    let resueltosTotalCount = 0;

    tickets.forEach((ticket) => {
      const proyecto = ticket.proyecto || 'General';
      const encargado = ticket.encargado || 'Sin Asignar';
      const tipo = ticket.tipo_incidencia || 'General';
      const estado = ticket.estado;

      proyectosMap[proyecto] = (proyectosMap[proyecto] || 0) + 1;

      if (!encargadosMap[encargado]) {
        encargadosMap[encargado] = { asignados: 0, resueltos: 0 };
      }
      encargadosMap[encargado].asignados += 1;

      const esResuelto = estado === 'resuelto' || estado === 'Cerrado' || estado === 'Resuelto';
      if (esResuelto) {
        encargadosMap[encargado].resueltos += 1;
        resueltosTotalCount += 1;
      }

      if (ticket.created_at && ticket.fecha_cierre) {
        const inicio = new Date(ticket.created_at).getTime();
        const fin = new Date(ticket.fecha_cierre).getTime();
        const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
        
        if (dias >= 0) {
          totalDiasCierre += dias;
          ticketsCerradosCount += 1;

          if (!tiemposMap[tipo]) {
            tiemposMap[tipo] = { sumaDias: 0, count: 0 };
          }
          tiemposMap[tipo].sumaDias += dias;
          tiemposMap[tipo].count += 1;
        }
      }
    });

    const calcPromedio = ticketsCerradosCount > 0 ? (totalDiasCierre / ticketsCerradosCount).toFixed(1) : '0';
    setTiempoPromedio(calcPromedio);

    const calcEfectividad = tickets.length > 0 ? Math.round((resueltosTotalCount / tickets.length) * 100) : 0;
    setEfectividad(`${calcEfectividad}%`);

    setDatosProyectos(Object.keys(proyectosMap).map(k => ({ proyecto: k, reportes: proyectosMap[k] })) as any);
    setDatosEncargados(Object.keys(encargadosMap).map(k => ({ encargado: k, ...encargadosMap[k] })) as any);
    setDatosTiempos(Object.keys(tiemposMap).map(k => ({
      tipo: k,
      dias: Number((tiemposMap[k].sumaDias / tiemposMap[k].count).toFixed(1))
    })) as any);
  };

  useEffect(() => {
    cargarDatos();

    const channel = supabase
      .channel('cambios-tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets_mantenimiento' },
        (payload) => {
          console.log('Cambio detectado en Supabase Realtime:', payload);
          cargarDatos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Barra Superior / Navbar Corporativa */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              width={220} 
              height={50} 
              style={{ objectFit: 'contain', borderRadius: '8px' }} 
              priority
            />
          </div>
          <div>
           
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gestión Inmobiliaria & Post-Entrega</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '0' }}>Gerencia Operativa</p>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>● Tiempo Real Activo</span>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>
            GO
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Título de Sección */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Dashboard de Rendimiento Operativo
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>
              Análisis consolidado de incidencias, cargas de trabajo de encargados y tiempos de respuesta.
            </p>
          </div>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            Sincronizado con Supabase
          </div>
        </div>

        {/* Tarjetas KPI Superiores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Reportes Acumulados</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '10px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0' }}>{totalReportes}</h2>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>En vivo</span>
            </div>
          </div>
          
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tiempo Promedio Cierre</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '10px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#2563eb', margin: '0' }}>{tiempoPromedio} Días</h2>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>Dinámico</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Efectividad General</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '10px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#16a34a', margin: '0' }}>{efectividad}</h2>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>Automático</span>
            </div>
          </div>
        </div>

        {/* Sección de Gráficos (Grid de 2 columnas) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* Gráfico 1: Proyectos */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                Reportes Acumulados por Proyecto Inmobiliario
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>Volumen total de incidencias registradas por desarrollo.</p>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={datosProyectos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="proyecto" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }} 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
                  />
                  <Bar dataKey="reportes" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Carga por Encargado */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                Carga de Trabajo y Efectividad por Encargado
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>Comparativa de tickets asignados vs. resueltos.</p>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={datosEncargados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="encargado" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                  <Bar dataKey="asignados" fill="#38bdf8" name="Asignados" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resueltos" fill="#10b981" name="Resueltos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Fila Inferior: Gráfico de Tiempos por Incidencia */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
              Tiempo Promedio de Resolución por Tipo de Incidencia (Días)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>Desglose de la velocidad de respuesta según la naturaleza del reporte técnico.</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={datosTiempos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tipo" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
                />
                <Bar dataKey="dias" fill="#f59e0b" name="Días Promedio" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}