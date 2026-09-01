'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SelectorModulos() {
  const [selected, setSelected] = useState<string | null>(null);

  const getButtonStyle = (id: string) => ({
    backgroundColor: selected === id ? '#f1f5f9' : '#ffffff',
    color: '#0f172a',
    padding: '18px 24px',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: selected === id ? '600' : '500',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: selected === id ? '1px solid #94a3b8' : '1px solid #e2e8f0',
    boxShadow: selected === id ? '0 4px 12px rgba(0, 0, 0, 0.04)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease',
    cursor: 'wait',
    opacity: selected && selected !== id ? 0.6 : 1
  });

  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fcfcfd', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      
      {/* Selector de Idioma Minimalista en la esquina superior */}
      <div style={{ position: 'absolute', top: '24px', right: '32px' }}>
        <select aria-label="Seleccionar idioma o región" style={{ 
          background: 'transparent', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '6px 12px', 
          fontSize: '12px', 
          color: '#64748b', 
          cursor: 'pointer',
          outline: 'none'
        }}>
          <option value="es">ES (Español)</option>
          <option value="en">EN (English)</option>
        </select>
      </div>

      {/* Tarjeta Central Minimalista y Elegante */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '56px 44px', 
        borderRadius: '28px', 
        border: '1px solid #eaeef2',
        boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.04), 0 4px 8px -4px rgba(0, 0, 0, 0.02)',
        width: '100%',
        maxWidth: '520px',
        textAlign: 'center'
      }}>
        
        {/* Logo Más Grande y Encabezado */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              width={320} 
              height={64} 
              style={{ objectFit: 'contain' }} 
              priority
            />
          </div>
        
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#090d16', margin: '0', letterSpacing: '-0.01em' }}>
              Portal de Gestión General
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0', fontWeight: '400' }}>
              Selecciona el módulo corporativo al que deseas ingresar.
            </p>
          </div>
        </div>

        {/* Botones con Indicador de Estado Activo y Transición */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Módulo de Mantenimiento */}
          <Link 
            href="/mantenimiento" 
            onClick={() => setSelected('mantenimiento')}
            style={getButtonStyle('mantenimiento')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
              Módulo de Mantenimiento
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
              Crear Reporte &rarr;
            </span>
          </Link>

          {/* Portal del Cliente */}
          <Link 
            href="/portal-clientes" 
            onClick={() => setSelected('clientes')}
            style={getButtonStyle('clientes')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
              Portal del Cliente
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
              Consultar Estado &rarr;
            </span>
          </Link>

          {/* Catálogo y Bitácora Pública */}
          <Link 
            href="/catalogo" 
            onClick={() => setSelected('catalogo')}
            style={getButtonStyle('catalogo')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
              Catálogo y Bitácora Pública
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
              Mercado &rarr;
            </span>
          </Link>

        </div>

        {/* Pie de Página con Soporte Técnico Discreto */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href="mailto:soporte@casasuertes.com" style={{ fontSize: '12px', color: '#64748b', textDecoration: 'none', fontWeight: '400' }}>
            ¿Problemas de acceso? <span style={{ color: '#0f172a', textDecoration: 'underline' }}>Contactar Soporte Técnico</span>
          </a>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0', letterSpacing: '0.025em' }}>
            CASASUERTES SAS &mdash; TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>

      </div>
    </main>
  );
}