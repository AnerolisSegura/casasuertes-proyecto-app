import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializa Resend usando la variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Datos recibidos en la API:", body);

    // Extraer correo del cliente (soporta prueba manual o datos del trigger)
    const emailDestino = body.record?.email_cliente || body.email || 'anosegura2006@gmail.com';

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // O tu dominio verificado en Resend
      to: [emailDestino],
      subject: 'Actualización de Estado - Ticket de Mantenimiento',
      html: `<p>Hola, el estado de tu solicitud ha cambiado.</p>`
    });

    console.log("Respuesta exitosa de Resend:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // Esto mostrará el error exacto en los logs de Vercel
    console.error("Error crítico en la API de notificaciones:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}