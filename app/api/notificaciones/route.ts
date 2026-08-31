import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const payload = await req.json();
    const { record, old_record } = payload;

    if (record && record.estado !== old_record?.estado) {
      const emailCliente = record.email_cliente || "cliente@casasuertes.com";

      await resend.emails.send({
        from: "Casasuertes Mantenimiento <no-reply@casasuertes-mantenimiento-app.vercel.app>",
        to: [emailCliente],
        subject: `Actualización de tu reporte en ${record.proyecto || "Casasuertes"} - ${record.estado}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
            <h2 style="color: #4f46e5;">Hola, ${record.nombre_cliente || "Propietario"}</h2>
            <p>Te informamos que tu solicitud de mantenimiento para el apartamento <b>${record.apartamento || ""}</b> ha cambiado de estatus.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><b>Tipo de Servicio:</b> ${record.tipo_incidencia || "General"}</p>
              <p style="margin: 5px 0;"><b>Nuevo Estado:</b> <span style="color: #10b981;">${record.estado}</span></p>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">Gracias por confiar en el equipo de post-entrega de Casasuertes.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en notificación:", error);
    // Retornamos 200 para que la base de datos de Supabase no bloquee la actualización del admin por un fallo de correo
    return NextResponse.json({ success: true, warning: "Error al enviar correo pero estado actualizado" }, { status: 200 });
  }
}