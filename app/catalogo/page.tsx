'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CatalogoProyectosMercado() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando,setCargando] = useState(true);

  useEffect(() => {
    async function obtenerProyectosMercado() {
      const { data, error } = await supabase
        .from('proyectos_mercado')
        .select('*');

      if (error) {
        console.error('Error al obtener los proyectos:', error);
      } else if (data) {
        setProyectos(data);
      }
      setCargando(false);
    }

    obtenerProyectosMercado();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Barra Superior / Navbar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Image 
            src="/logo.png" 
            alt="Casasuertes Logo" 
            width={250} 
            height={42} 
            style={{ objectFit: 'contain', borderRadius: '8px' }} 
            priority
          />
          <div>
        
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portafolio de Desarrollos</span>
          </div>
        </div>
        <div>
          <Link 
            href="/portal-clientes" 
            style={{ background: '#4f46e5', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
          >
            Acceso Clientes (Bitácora)
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '40px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            Proyectos Disponibles en el Mercado
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0' }}>
            Explora nuestros desarrollos inmobiliarios y consulta su estatus general de construcción.
          </p>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
            Cargando proyectos disponibles...
          </div>
        ) : proyectos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '15px', margin: '0' }}>No hay proyectos registrados en este momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {proyectos.map((proy) => (
              <div key={proy.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Imagen o Banner del Proyecto */}
                <div style={{ height: '200px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                  {proy.imagen_url ? (
                    <img src={proy.imagen_url} alt={proy.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>
                      CASASUERTES
                    </div>
                  )}
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                    {proy.estado_obra || 'En desarrollo'}
                  </span>
                </div>

                {/* Información del Proyecto */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                      {proy.nombre}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                      {proy.descripcion || 'Desarrollo inmobiliario exclusivo diseñado con altos estándares de calidad y confort.'}
                    </p>
                    
                    {/* Barra de Progreso General */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                        <span>Avance Global de Obra</span>
                        <span>{proy.porcentaje_avance || 0}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${proy.porcentaje_avance || 0}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Ubicación: {proy.ubicacion || 'Zona Metropolitana'}</span>
                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '700' }}>Ver detalles →</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}