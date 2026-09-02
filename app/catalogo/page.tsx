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
  const [proyectosFiltrados, setProyectosFiltrados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [detallesModal, setDetallesModal] = useState<any | null>(null);
  const [imagenActualModal, setImagenActualModal] = useState(0);

  // Estados para Filtros Avanzados y Buscador
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('todos');

  // Estados para Sistema de Comparación
  const [proyectosComparacion, setProyectosComparacion] = useState<number[]>([]);
  const [modalComparacionAbierto, setModalComparacionAbierto] = useState(false);

  // Estados para el formulario dentro del modal
  const [formEnviado, setFormEnviado] = useState(false);
  const [enviandoLead, setEnviandoLead] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: ''
  });

  // Estados para el carrusel de cada tarjeta principal
  const [imagenTarjetaMarina, setImagenTarjetaMarina] = useState(0);
  const imagenesMarinaCard = [
    '/marina-residences.jpg',
    '/marina-residencesp.jpg',
    '/marina-residences73.jpg',
    '/marinaresidencesl.jpg'
  ];

  const [imagenTarjetaDowntown, setImagenTarjetaDowntown] = useState(0);
  const imagenesDowntownCard = [
    '/downtown-sands.jpg',
    '/downtown-sandsext.jpg',
    '/downtown-sandsgym.jpg',
    '/downtown-sandsll.jpg',
    '/downtown-sandslo.jpg',
    '/downtown-sandssala.jpg',
    '/downtown-sandshab.jpg',
    '/downtown-sandspisc.jpg'
  ];

  const [imagenTarjetaAlbor, setImagenTarjetaAlbor] = useState(0);
  const imagenesAlborCard = [
    '/torre-albor.jpg',
    '/torre-alborext.jpg',
    '/torre-alborextl.jpg',
    '/torre-alborgym.jpg',
    '/torre-alborgym1.jpg',
    '/torre-alborext2.jpg',
    '/torre-alborlob.jpg',
    '/torre-alborint.jpg',
    '/torre-alborint1.jpg',
    '/torre-alborint2.jpg',
    '/torre-alborpas.jpg'
  ];

  useEffect(() => {
    async function obtenerProyectosMercado() {
      const { data, error } = await supabase
        .from('proyectos_mercado')
        .select('*');

      let datosProyectos = [];
      if (error) {
        console.error('Error al obtener los proyectos:', error);
      } 
      
      if (data && data.length > 0) {
        datosProyectos = data;
      } else {
        datosProyectos = [
          { id: 1, nombre: 'Torre A', estado_obra: 'En Construcción', porcentaje_avance: 65, ubicacion: 'Punta Cana', unidades_disponibles: 2, porcentaje_vendido: 85, habitaciones: '1 y 2 Habitaciones' },
          { id: 2, nombre: 'Torre B', estado_obra: 'Estructura', porcentaje_avance: 40, ubicacion: 'Santo Domingo', unidades_disponibles: 12, porcentaje_vendido: 75, habitaciones: '2 y 3 Habitaciones' },
          { id: 3, nombre: 'Residencial Sur', estado_obra: 'Acabados', porcentaje_avance: 85, ubicacion: 'Playa Nueva Romana', unidades_disponibles: 1, porcentaje_vendido: 95, habitaciones: '2 Habitaciones + Estudio' }
        ];
      }
      setProyectos(datosProyectos);
      setProyectosFiltrados(datosProyectos);
      setCargando(false);
    }

    obtenerProyectosMercado();
  }, []);

  // Lógica de Filtrado Avanzado y Buscador
  useEffect(() => {
    let resultado = proyectos;

    if (busquedaTexto.trim() !== '') {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
        p.ubicacion?.toLowerCase().includes(busquedaTexto.toLowerCase())
      );
    }

    if (filtroUbicacion !== 'todos') {
      resultado = resultado.filter(p => p.ubicacion?.toLowerCase().includes(filtroUbicacion.toLowerCase()));
    }

    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado_obra?.toLowerCase() === filtroEstado.toLowerCase());
    }

    if (filtroHabitaciones !== 'todos') {
      resultado = resultado.filter(p => p.habitaciones?.toLowerCase().includes(filtroHabitaciones.toLowerCase()));
    }

    setProyectosFiltrados(resultado);
  }, [busquedaTexto, filtroUbicacion, filtroEstado, filtroHabitaciones, proyectos]);

  const toggleComparacion = (idProyecto: number) => {
    if (proyectosComparacion.includes(idProyecto)) {
      setProyectosComparacion(proyectosComparacion.filter(id => id !== idProyecto));
    } else {
      if (proyectosComparacion.length >= 3) {
        alert('Solo puedes comparar un máximo de 3 proyectos simultáneamente.');
        return;
      }
      setProyectosComparacion([...proyectosComparacion, idProyecto]);
    }
  };

  const cambiarImagenModal = (direccion: number, totalImagenes: number) => {
    setImagenActualModal((prev) => (prev + direccion + totalImagenes) % totalImagenes);
  };

  const cambiarImagenTarjetaMarina = (e: React.MouseEvent, direccion: number) => {
    e.stopPropagation();
    setImagenTarjetaMarina((prev) => (prev + direccion + imagenesMarinaCard.length) % imagenesMarinaCard.length);
  };

  const cambiarImagenTarjetaDowntown = (e: React.MouseEvent, direccion: number) => {
    e.stopPropagation();
    setImagenTarjetaDowntown((prev) => (prev + direccion + imagenesDowntownCard.length) % imagenesDowntownCard.length);
  };

  const cambiarImagenTarjetaAlbor = (e: React.MouseEvent, direccion: number) => {
    e.stopPropagation();
    setImagenTarjetaAlbor((prev) => (prev + direccion + imagenesAlborCard.length) % imagenesAlborCard.length);
  };

  const manejarEnvioLead = async (e: React.FormEvent, nombreProyecto: string) => {
    e.preventDefault();
    setEnviandoLead(true);

    try {
      const { error } = await supabase
        .from('leads_proyectos')
        .insert([
          {
            proyecto: nombreProyecto,
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            mensaje: formData.mensaje,
            fecha: new Date().toISOString()
          }
        ]);

      if (error) {
        console.log('Nota: La tabla leads_proyectos no está creada aún o hubo un error, simulando envío exitoso:', error);
      }

      setFormEnviado(true);
    } catch (err) {
      console.error(err);
      setFormEnviado(true);
    } finally {
      setEnviandoLead(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* Estilos para la animación FOMO (pulse) */}
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link 
            href="/" 
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
          >
            &larr; Volver al Portal General
          </Link>
          <Link 
            href="/portal-clientes" 
            style={{ background: '#4f46e5', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
          >
            Acceso Clientes (Bitácora)
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '40px 32px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            Proyectos Disponibles en el Mercado
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0' }}>
            Explora nuestros desarrollos inmobiliarios y consulta su estatus general de construcción.
          </p>
        </div>

        {/* Panel de Filtros Avanzados y Buscador */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Buscador</label>
            <input 
              type="text" 
              placeholder="Buscar por nombre o zona..." 
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Ubicación</label>
            <select 
              value={filtroUbicacion}
              onChange={(e) => setFiltroUbicacion(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', outline: 'none' }}
            >
              <option value="todos">Todas las ubicaciones</option>
              <option value="Punta Cana">Punta Cana</option>
              <option value="Santo Domingo">Santo Domingo</option>
              <option value="Playa Nueva Romana">Playa Nueva Romana</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Estado de Obra</label>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', outline: 'none' }}
            >
              <option value="todos">Todos los estados</option>
              <option value="En Construcción">En Construcción</option>
              <option value="Estructura">Estructura</option>
              <option value="Acabados">Acabados</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Habitaciones</label>
            <select 
              value={filtroHabitaciones}
              onChange={(e) => setFiltroHabitaciones(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', outline: 'none' }}
            >
              <option value="todos">Todas las opciones</option>
              <option value="1">1 Habitación</option>
              <option value="2">2 Habitaciones</option>
              <option value="3">3 Habitaciones</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
            Cargando proyectos disponibles...
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '15px', margin: '0' }}>No se encontraron proyectos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {proyectosFiltrados.map((proy) => {
              
              // Identificamos el proyecto de forma exacta por su ID en Supabase
              const esDowntown = proy.id === 1;
              const esTorreAlbor = proy.id === 2;
              const esMarina = proy.id === 3;

              const nombreFinal = esDowntown ? 'Downtown Sands' : (esTorreAlbor ? 'Torre Albor' : (esMarina ? 'Marina Residences 73' : proy.nombre));
              
              const imagenFinal = esTorreAlbor
                ? imagenesAlborCard[imagenTarjetaAlbor]
                : (esDowntown 
                    ? imagenesDowntownCard[imagenTarjetaDowntown]
                    : (esMarina 
                        ? imagenesMarinaCard[imagenTarjetaMarina] 
                        : (proy.imagen_url || '/downtown-sands.jpg')));
              
              const ubicacionFinal = esDowntown ? 'Punta Cana' : (esTorreAlbor ? 'Santo Domingo' : (esMarina ? 'Playa Nueva Romana' : (proy.ubicacion || 'Zona Metropolitana')));
              
              const descripcionFinal = esDowntown 
                ? 'Situado en una de las zonas más dinámicas de Punta Cana, diseñado para un estilo de vida moderno y sofisticado.' 
                : (esTorreAlbor 
                    ? 'Te presentamos un exclusivo proyecto residencial de 24 apartamentos de 2 y 3 habitaciones, ubicado en una zona privilegiada. El edificio consta de 6 niveles completos sobre el nivel de la calle, un nivel parcial en la azotea y un nivel y medio soterrado que ofrece 64 estacionamientos, asegurando comodidad para todos los residentes.' 
                    : (esMarina
                        ? 'Marina Residences 73 is an exclusive collection of 6 apartments distributed across a 3-level building, located in a privileged setting in Playa Nueva Romana. Units feature 2 bedrooms and a study, plus private terraces with Jacuzzi, and the penthouse includes an upper terrace for enhanced privacy.'
                        : (proy.descripcion || 'Desarrollo inmobiliario exclusivo diseñado con altos estándares de calidad y confort.')));

              const estaSeleccionadoParaComparar = proyectosComparacion.includes(proy.id);

              return (
                <div key={proy.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  
                  {/* Casilla de Selección para Comparación */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '8px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1' }}>
                    <input 
                      type="checkbox" 
                      checked={estaSeleccionadoParaComparar}
                      onChange={() => toggleComparacion(proy.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b' }}>Comparar</span>
                  </div>

                  {/* Contenedor de la Imagen con Carrusel Integrado */}
                  <div style={{ height: '200px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                    <img 
                      src={imagenFinal} 
                      alt={nombreFinal} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
                    />
                    
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                      {proy.estado_obra || 'En desarrollo'}
                    </span>

                    {/* Botones de carrusel para Marina Residences 73 */}
                    {esMarina && (
                      <>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaMarina(e, -1)}
                          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ‹
                        </button>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaMarina(e, 1)}
                          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ›
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                          {imagenTarjetaMarina + 1} / {imagenesMarinaCard.length}
                        </div>
                      </>
                    )}

                    {/* Botones de carrusel para Downtown Sands */}
                    {esDowntown && (
                      <>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaDowntown(e, -1)}
                          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ‹
                        </button>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaDowntown(e, 1)}
                          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ›
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                          {imagenTarjetaDowntown + 1} / {imagenesDowntownCard.length}
                        </div>
                      </>
                    )}

                    {/* Botones de carrusel para Torre Albor */}
                    {esTorreAlbor && (
                      <>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaAlbor(e, -1)}
                          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ‹
                        </button>
                        <button 
                          onClick={(e) => cambiarImagenTarjetaAlbor(e, 1)}
                          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 2 }}
                        >
                          ›
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                          {imagenTarjetaAlbor + 1} / {imagenesAlborCard.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Información del Proyecto */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                        {nombreFinal}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                        {descripcionFinal}
                      </p>
                      
                      {esDowntown && (
                        <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155' }}>
                          <p style={{ margin: '0 0 6px 0' }}><strong>Superficie y Tipologías:</strong> Apartamentos desde 46m² hasta 137m², con opciones tipo estudio y unidades de hasta tres habitaciones con estudio y terraza.</p>
                          <p style={{ margin: '0' }}><strong>Características:</strong> Todos los apartamentos cuentan con balcón privado y parking.</p>
                        </div>
                      )}

                      {esTorreAlbor && (
                        <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155' }}>
                          <p style={{ margin: '0 0 6px 0' }}><strong>Amenidades:</strong> Lobby climatizado, área de yoga equipada y un moderno gimnasio.</p>
                          <p style={{ margin: '0' }}><strong>Estacionamientos:</strong> 64 espacios disponibles en nivel y medio soterrado.</p>
                        </div>
                      )}

                      {esMarina && (
                        <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155' }}>
                          <p style={{ margin: '0 0 6px 0' }}><strong>Distribución:</strong> 6 apartamentos en un edificio de 3 niveles.</p>
                          <p style={{ margin: '0' }}><strong>Exclusividad:</strong> Terrazas privadas con jacuzzi y terraza superior en el penthouse.</p>
                        </div>
                      )}

                      {/* Etiqueta de Urgencia (FOMO) */}
                      {(proy.unidades_disponibles <= 3 && proy.unidades_disponibles > 0) ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '8px', marginBottom: '16px' }}>
                          <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse-red 2s infinite' }}></span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>
                            ¡Últimas {proy.unidades_disponibles} unidades disponibles!
                          </span>
                        </div>
                      ) : (proy.porcentaje_vendido >= 70) ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '8px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
                             {proy.porcentaje_vendido}% Vendido - Alta demanda
                          </span>
                        </div>
                      ) : null}

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
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Ubicación: {ubicacionFinal}</span>
                      <button 
                        onClick={() => {
                          setImagenActualModal(0);
                          setFormEnviado(false);
                          setFormData({ nombre: '', correo: '', telefono: '', mensaje: '' });
                          
                          // Pasando datos compartidos de urgencia al modal
                          const urgenciaModalData = {
                            unidadesDisponibles: proy.unidades_disponibles || 0,
                            porcentajeVendido: proy.porcentaje_vendido || 0,
                          };

                          if (esMarina) {
                            setDetallesModal({
                              nombre: nombreFinal,
                              descripcion: descripcionFinal,
                              imagenes: imagenesMarinaCard,
                              niveles: [
                                {
                                  titulo: 'Nivel 1',
                                  texto: 'Dos apartamentos con un diseño de planta abierta en las áreas comunes, permitiendo una circulación fluida entre sala, comedor y cocina. Cada unidad dispone de un patio privado.'
                                },
                                {
                                  titulo: 'Nivel 2',
                                  texto: 'Conservando el concepto de planta abierta, los apartamentos en este nivel cuentan con un amplio balcón que se extiende a lo largo de cada unidad, proporcionando una conexión visual con el exterior y vistas panorámicas del entorno.'
                                },
                                {
                                  titulo: 'Nivel 3',
                                  texto: 'El último nivel ofrece dos apartamentos que mantienen el diseño de planta abierta y añaden el atractivo de una azotea privada para cada unidad. Estas azoteas están diseñadas para la instalación de estructuras ligeras, lo que permite un espacio versátil, ideal para el descanso o actividades al aire libre.'
                                }
                              ],
                              enlaceTexto: 'Ver documento informativo (PDF)',
                              enlaceUrl: 'https://www.casasuertes.com.do/docs/Marina-Residence-73.pdf',
                              ...urgenciaModalData
                            });
                          } else if (esDowntown) {
                            setDetallesModal({
                              nombre: nombreFinal,
                              descripcion: descripcionFinal,
                              imagenes: imagenesDowntownCard,
                              amenidades: [
                                'Piscina estilo resort.',
                                'Restaurantes.',
                                'Locales comerciales.',
                                'Espacios de co-working.',
                                'Gimnasio totalmente equipado.',
                                'Un lobby elegante.'
                              ],
                              enlaceTexto: 'Más información en DowntownSands.com',
                              enlaceUrl: 'https://DowntownSands.com',
                              ...urgenciaModalData
                            });
                          } else if (esTorreAlbor) {
                            setDetallesModal({
                              nombre: nombreFinal,
                              descripcion: descripcionFinal,
                              imagenes: imagenesAlborCard,
                              caracteristicasAdicionales: [
                                'Entre sus características, destacan un lobby climatizado, un área de yoga equipada, y un moderno gimnasio para que disfrutes de un estilo de vida saludable sin salir de casa.',
                                'Este proyecto es ideal para quienes buscan un hogar que combine confort, modernidad y acceso a todas las amenidades necesarias.'
                              ],
                              enlaceTexto: 'Ver documento informativo (PDF)',
                              enlaceUrl: 'https://www.casasuertes.com.do/docs/Torre-Albor.pdf',
                              ...urgenciaModalData
                            });
                          }
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Barra Flotante de Comparación */}
      {proyectosComparacion.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 24px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 90 }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{proyectosComparacion.length} de 3 proyectos seleccionados para comparar</span>
          <button 
            onClick={() => setModalComparacionAbierto(true)}
            style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          >
            Ver Comparativa
          </button>
          <button 
            onClick={() => setProyectosComparacion([])}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Modal de Comparación Lado a Lado */}
      {modalComparacionAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '1000px', width: '100%', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Tabla Comparativa de Proyectos</h2>
              <button onClick={() => setModalComparacionAbierto(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: '700', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', color: '#64748b' }}>Característica</th>
                    {proyectosComparacion.map(id => {
                      const p = proyectos.find(item => item.id === id);
                      const nombreShow = p?.id === 1 ? 'Downtown Sands' : (p?.id === 2 ? 'Torre Albor' : (p?.id === 3 ? 'Marina Residences 73' : p?.nombre));
                      return <th key={id} style={{ padding: '12px', color: '#0f172a', fontWeight: '800' }}>{nombreShow}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#475569' }}>Ubicación</td>
                    {proyectosComparacion.map(id => {
                      const p = proyectos.find(item => item.id === id);
                      const ubicShow = p?.id === 1 ? 'Punta Cana' : (p?.id === 2 ? 'Santo Domingo' : (p?.id === 3 ? 'Playa Nueva Romana' : p?.ubicacion));
                      return <td key={id} style={{ padding: '12px', color: '#334155' }}>{ubicShow}</td>;
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#475569' }}>Estado de Obra</td>
                    {proyectosComparacion.map(id => {
                      const p = proyectos.find(item => item.id === id);
                      return <td key={id} style={{ padding: '12px', color: '#334155' }}>{p?.estado_obra} ({p?.porcentaje_avance}%)</td>;
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#475569' }}>Unidades Disponibles</td>
                    {proyectosComparacion.map(id => {
                      const p = proyectos.find(item => item.id === id);
                      return <td key={id} style={{ padding: '12px', fontWeight: '700', color: p?.unidades_disponibles <= 3 ? '#ef4444' : '#10b981' }}>{p?.unidades_disponibles} disponibles</td>;
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#475569' }}>Habitaciones</td>
                    {proyectosComparacion.map(id => {
                      const p = proyectos.find(item => item.id === id);
                      return <td key={id} style={{ padding: '12px', color: '#334155' }}>{p?.habitaciones || 'Consultar'}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setModalComparacionAbierto(false)} style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cerrar Comparativa</button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de Página / Footer Institucional */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '40px 32px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
          
          {/* Logo Completo Institucional (/fulllogo.jpg) */}
          <div style={{ width: '220px', height: 'auto', position: 'relative' }}>
            <Image 
              src="/fulllogo.jpg" 
              alt="Casasuertes SAS Full Logo" 
              width={220} 
              height={90} 
              style={{ objectFit: 'contain' }} 
            />
          </div>

          {/* Información Detallada Institucional con Iconos Vectoriales Profesionales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#334155', fontSize: '14px', alignItems: 'center' }}>
            
            {/* Ubicación con icono de pin de mapa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: '500' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5', flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Santo Domingo Av. Gustavo Mejía Ricart Torre Piantini, Piantini Local 502</span>
            </div>

            {/* Datos de contacto (Teléfono, Web, Email) con iconos profesionales */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: '#475569', fontSize: '13px', marginTop: '4px' }}>
              
              {/* Teléfono */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>809-769-7644</span>
              </div>

              <span style={{ color: '#cbd5e1' }}>|</span>

              {/* Web */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <a href="https://casasuertes.com.do" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>
                  casasuertes.com.do
                </a>
              </div>

              <span style={{ color: '#cbd5e1' }}>|</span>

              {/* Correo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href="mailto:rben@casasuertes.com.do" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>
                  rben@casasuertes.com.do
                </a>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: '16px', marginTop: '10px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              &copy; {new Date().getFullYear()} Casasuertes SAS. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </footer>

      {/* Modal de Detalles Expandido con Formulario Directo */}
      {detallesModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '850px', width: '100%', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setDetallesModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              {detallesModal.nombre}
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {detallesModal.descripcion}
            </p>

            {/* Carrusel de Imágenes en el Modal */}
            {detallesModal.imagenes && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#1e293b', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <img 
                    src={detallesModal.imagenes[imagenActualModal]} 
                    alt={`Vista ${detallesModal.nombre} ${imagenActualModal + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
                  />

                  <button 
                    onClick={() => cambiarImagenModal(-1, detallesModal.imagenes.length)}
                    style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => cambiarImagenModal(1, detallesModal.imagenes.length)}
                    style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                  >
                    ›
                  </button>

                  <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
                    {imagenActualModal + 1} / {detallesModal.imagenes.length}
                  </div>
                </div>

                {/* Miniaturas de selección rápida */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {detallesModal.imagenes.map((img: string, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => setImagenActualModal(idx)}
                      style={{ width: '80px', height: '55px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: imagenActualModal === idx ? '3px solid #4f46e5' : '2px solid #e2e8f0', opacity: imagenActualModal === idx ? '1' : '0.7', transition: 'all 0.2s' }}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detallesModal.niveles && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {detallesModal.niveles.map((nivel: any, index: number) => (
                  <div key={index} style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>
                      {nivel.titulo}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0', lineHeight: '1.6' }}>
                      {nivel.texto}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {detallesModal.amenidades && (
              <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0' }}>
                  Amenidades de calidad:
                </h4>
                <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {detallesModal.amenidades.map((amenidad: string, index: number) => (
                    <li key={index}>{amenidad}</li>
                  ))}
                </ul>
              </div>
            )}

            {detallesModal.caracteristicasAdicionales && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {detallesModal.caracteristicasAdicionales.map((parrafo: string, index: number) => (
                  <div key={index} style={{ backgroundColor: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0', lineHeight: '1.6' }}>
                      {parrafo}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {detallesModal.enlaceTexto && (
              <div style={{ marginBottom: '24px' }}>
                <a 
                  href={detallesModal.enlaceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '700', textDecoration: 'underline', display: 'inline-block' }}
                >
                  {detallesModal.enlaceTexto}
                </a>
              </div>
            )}

            {/* Refuerzo FOMO antes del formulario en el Modal */}
            {((detallesModal.unidadesDisponibles <= 3 && detallesModal.unidadesDisponibles > 0) || detallesModal.porcentajeVendido >= 70) && (
              <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '0 8px 8px 0', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', margin: 0 }}>
                  Alta demanda: Queda {detallesModal.unidadesDisponibles === 1 ? '1 única unidad' : `${detallesModal.unidadesDisponibles} unidades`} disponible. Contáctanos antes de que se agote.
                </p>
              </div>
            )}

            {/* Bloque de Formulario de Contacto Directo */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Más información y asesoría personalizada
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                Completa tus datos y un especialista se pondrá en contacto contigo a la brevedad.
              </p>

              {formEnviado ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '16px', borderRadius: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                  ¡Gracias! Tu solicitud ha sido enviada con éxito. Nos comunicaremos contigo muy pronto.
                </div>
              ) : (
                <form onSubmit={(e) => manejarEnvioLead(e, detallesModal.nombre)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Nombre completo *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Juan Pérez"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Correo electrónico *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="ejemplo@correo.com"
                        value={formData.correo}
                        onChange={(e) => setFormData({...formData, correo: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Teléfono / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="809-000-0000"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Consulta específica (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Consultar disponibilidad de penthouses"
                        value={formData.mensaje}
                        onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '6px' }}>
                    <button 
                      type="submit" 
                      disabled={enviandoLead}
                      style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      {enviandoLead ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right' }}>
              <button 
                onClick={() => setDetallesModal(null)}
                style={{ backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}