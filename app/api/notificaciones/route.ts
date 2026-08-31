import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    
    const record = body.record || body;
    const emailDestino = record.email_cliente || 'anosegura2006@gmail.com';
    const estadoNuevo = record.estado || 'Actualizado';
    const tipoIncidencia = record.tipo_incidencia || 'Mantenimiento';

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [emailDestino],
      subject: `Actualización de Ticket: ${tipoIncidencia}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hola ${record.nombre_cliente || 'Estimado cliente'},</h2>
          <p>El estado de tu ticket de mantenimiento ha cambiado a: <strong>${estadoNuevo}</strong>.</p>
          <p><strong>Proyecto:</strong> ${record.proyecto || 'N/A'} - Apto ${record.apartamento || 'N/A'}</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">Casasuertes Mantenimiento</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error detallado:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}