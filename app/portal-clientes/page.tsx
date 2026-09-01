'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalClientes() {
  const [cedula, setCedula] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [clienteData, setClienteData] = useState<any>(null);
  const [bitacora, setBitacora] = useState<any[]>([]);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) {
      setError('Por favor ingresa tu número de cédula o pasaporte.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      // 1. Buscar al cliente y hacer join con el proyecto asignado
      const { data: cliente, error: errCliente } = await supabase
        .from('clientes_propietarios')
        .select(`
          *,
          proyectos_mercado (
            id,
            nombre,
            descripcion,
            ubicacion,
            imagen_url,
            porcentaje_avance,
            estado_obra
          )
        `)
        .eq('cedula_pasaporte', cedula.trim())
        .single();

      if (errCliente || !cliente) {
        setError('No se encontró ningún registro asociado a esta cédula. Verifica tus datos.');
        setClienteData(null);
        setBitacora([]);
        setCargando(false);
        return;
      }

      setClienteData(cliente);

      // 2. Obtener la bitácora de avance exclusiva de este proyecto
      const { data: reportesBitacora, error: errBitacora } = await supabase
        .from('bitacora_avance')
        .select('*')
        .eq('proyecto_id', cliente.proyecto_id)
        .order('fecha_reporte', { ascending: false });

      if (errBitacora) {
        console.error('Error al cargar la bitácora:', errBitacora);
      } else {
        setBitacora(reportesBitacora || []);
      }

    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Ocurrió un error al procesar tu solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Barra Superior / Navbar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Image 
            src="/logo.png" 
            alt="Casasuertes Logo" 
            width={250} 
            height={50} 
            style={{ objectFit: 'contain', borderRadius: '8px' }} 
            priority
          />
          <div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portal de Propietarios</span>
          </div>
        </div>
        <div>
          <a 
            href="/" 
            style={{ color: '#4f46e5', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}
          >
            ← Volver al Catálogo Público
          </a>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '40px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {!clienteData ? (
          /* Pantalla de Inicio de Sesión por Cédula */
          <div style={{ maxWidth: '450px', margin: '60px auto', background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Acceso a Bitácora Privada
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                Ingresa tu número de cédula o pasaporte para consultar el avance de tu unidad.
              </p>
            </div>

            <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Cédula o Pasaporte
                </label>
                <input 
                  type="text" 
                  value={cedula} 
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej. 001-1234567-8"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {error && (
                <div style={{ backgroundColor: '#ffeeec', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={cargando}
                style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                {cargando ? 'Validando...' : 'Consultar Bitácora'}
              </button>
            </form>
          </div>
        ) : (
          /* Vista Privada del Cliente Logueado */
          <div>
            {/* Cabecera de Bienvenida */}
            <div style={{ background: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Propietario Verificado</span>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px 0' }}>
                  ¡Hola, {clienteData.nombre_cliente}!
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                  Unidad Inmobiliaria: <strong style={{ color: '#0f172a' }}>{clienteData.unidad_inmobiliaria}</strong> ({clienteData.proyectos_mercado?.nombre})
                </p>
              </div>
              <button 
                onClick={() => setClienteData(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Resumen del Proyecto del Cliente */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0' }}>
                Estatus Actual del Proyecto: {clienteData.proyectos_mercado?.nombre}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                <span>Progreso General Registrado por Ingeniería</span>
                <span>{clienteData.proyectos_mercado?.porcentaje_avance || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${clienteData.proyectos_mercado?.porcentaje_avance || 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '5px' }}></div>
              </div>
            </div>

            {/* Bitácora de Avance Detallada */}
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
              Bitácora Fotográfica y Reportes de Obra
            </h2>

            {bitacora.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                Aún no hay reportes de bitácora publicados para este proyecto.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {bitacora.map((reporte) => (
                  <div key={reporte.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {reporte.fotografia_url && (
                      <div style={{ height: '200px', backgroundColor: '#e2e8f0' }}>
                        <img src={reporte.fotografia_url} alt={reporte.titulo_reporte} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{reporte.fecha_reporte}</span>
                          <span style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                            Etapa: {reporte.porcentaje_etapa}%
                          </span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                          {reporte.titulo_reporte}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0', lineHeight: '1.5' }}>
                          {reporte.descripcion_avance}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}