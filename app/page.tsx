'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SelectorModulos() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      
      {/* Tarjeta Central */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '40px 32px', 
        borderRadius: '24px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center'
      }}>
        
        {/* Logo y Título */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              width={280} 
              height={56} 
              style={{ objectFit: 'contain', borderRadius: '12px' }} 
              priority
            />
          </div>
        
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
            Selecciona el módulo al que deseas ingresar.
          </p>
        </div>

        {/* Botones de Navegación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Módulo de Mantenimiento */}
          <Link 
            href="/mantenimiento" 
            style={{ 
              backgroundColor: '#4f46e5', 
              color: '#ffffff', 
              padding: '14px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              display: 'block',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
          >
            Módulo de Mantenimiento (Crear Reporte)
          </Link>

          {/* Portal del Cliente */}
          <Link 
            href="/portal-clientes" 
            style={{ 
              backgroundColor: '#059669', 
              color: '#ffffff', 
              padding: '14px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              display: 'block',
              boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
            }}
          >
            Portal del Cliente (Consultar Estado)
          </Link>

          {/* Catálogo y Bitácora Pública (Nuevo) */}
          <Link 
            href="/catalogo" 
            style={{ 
              backgroundColor: '#0284c7', 
              color: '#ffffff', 
              padding: '14px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              display: 'block',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)'
            }}
          >
            Catálogo y Bitácora Pública (Mercado)
          </Link>

          {/* Bitácora / Avances anterior (Si aplica) */}
          <Link 
            href="/avance" 
            style={{ 
              backgroundColor: '#0f172a', 
              color: '#ffffff', 
              padding: '14px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              display: 'block',
              boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)'
            }}
          >
            Bitácora Interna (Ver Avances y Progreso)
          </Link>

        </div>

      </div>
    </div>
  );
}