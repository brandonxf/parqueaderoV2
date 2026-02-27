import SibApiV3Sdk from 'sib-api-v3-sdk'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { toLocalDate } from '@/lib/time'

const defaultClient = SibApiV3Sdk.ApiClient.instance
const apiKeyAuth = defaultClient.authentications['api-key']
const brevoKey = process.env.BREVO_KEY || process.env.BREVO_API_KEY || ''
apiKeyAuth.apiKey = brevoKey
const brevo = new SibApiV3Sdk.TransactionalEmailsApi()

// Si están configuradas las credenciales SMTP, crear un transporter de nodemailer
const smtpHost = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST || process.env.SMTP_SERVER
const smtpPort = process.env.SMTP_PORT || process.env.BREVO_SMTP_PORT || '587'
const smtpUser = process.env.SMTP_USER || process.env.BREVO_SMTP_USER || process.env.SMTP_IDENTIFICADORA
const smtpPass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS || process.env.SMTP_PASSWORD

let smtpTransport: nodemailer.Transporter | null = null
if (smtpHost && smtpUser && smtpPass) {
  smtpTransport = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    }
  })
}

// Professional email templates for ParkControl

export async function sendEntryTicket(email: string, ticketData: any) {
  try {
    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(ticketData.codigo_ticket, {
      type: 'png',
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'M'
    })

    const formattedDate = (() => {
      const d = toLocalDate(ticketData.fecha_entrada)
      return d ? d.toLocaleString('es-CO', { 
        timeZone: 'America/Bogota', 
        hour12: false,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'
    })()

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Confirmación de Ingreso - ParkControl</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <!-- Header -->
            <tr>
              <td style="padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ParkControl</h1>
                <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">Sistema de Gestión de Parqueadero</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 24px; color: #1e293b; font-size: 24px; font-weight: 600;">Confirmación de Ingreso</h2>
                <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                  Tu vehículo ha sido registrado exitosamente en nuestro sistema de parqueadero. A continuación encontrás los detalles de tu ingreso:
                </p>
                
                <!-- Details Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Placa del Vehículo</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 20px; font-weight: 700; font-family: monospace;">${ticketData.placa}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Código de Ticket</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 20px; font-weight: 700;">${ticketData.codigo_ticket}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Fecha y Hora de Ingreso</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${formattedDate}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <span style="color: #64748b; font-size: 14px;">Espacio Asignado</span>
                            <p style="margin: 4px 0 0; color: #3b82f6; font-size: 20px; font-weight: 700;">${ticketData.espacio}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- QR Info -->
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                    📱 Presenta este código QR en la salida para registrar tu salida automáticamente
                  </p>
                </div>
                
                <!-- Footer -->
                <p style="margin: 0; color: #94a3b8; font-size: 14px; text-align: center;">
                  Por favor conserva este correo electrónico como comprobante de ingreso.<br>
                  Si tienes alguna pregunta, no dudes en contactarnos.
                </p>
              </td>
            </tr>
            
            <!-- Bottom Bar -->
            <tr>
              <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  © 2026 ParkControl. Todos los derechos reservados.<br>
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

    const senderEmail = process.env.EMAIL_SENDER || process.env.EMAIL_FROM || 'no-reply@parkcontrol.example'

    if (smtpTransport) {
      await smtpTransport.sendMail({
        from: `ParkControl <${senderEmail}>`,
        to: email,
        subject: '🅿️ Confirmación de Ingreso - ParkControl',
        html,
        attachments: [
          {
            filename: 'codigo-qr.png',
            content: qrBuffer,
            contentType: 'image/png'
          }
        ]
      })
    } else {
      const qrBase64 = qrBuffer.toString('base64')
      const sendSmtpEmail = new SibApiV3Sdk.SendTransacEmail()
      sendSmtpEmail.sender = { name: 'ParkControl', email: senderEmail }
      sendSmtpEmail.to = [{ email }]
      sendSmtpEmail.subject = '🅿️ Confirmación de Ingreso - ParkControl'
      sendSmtpEmail.htmlContent = html
      sendSmtpEmail.attachment = [
        {
          name: 'codigo-qr.png',
          content: qrBase64
        }
      ]

      await brevo.sendTransacEmail(sendSmtpEmail)
    }
    console.log('Email de entrada enviado a:', email)
  } catch (error) {
    console.error('Error sending entry email:', error)
  }
}

export async function sendExitTicket(email: string, exitData: any) {
  try {
    const formattedEntrada = (() => {
      const d = toLocalDate(exitData.fecha_entrada)
      return d ? d.toLocaleString('es-CO', { 
        timeZone: 'America/Bogota', 
        hour12: false,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'
    })()

    const formattedSalida = (() => {
      const d = toLocalDate(exitData.fecha_salida)
      return d ? d.toLocaleString('es-CO', { 
        timeZone: 'America/Bogota', 
        hour12: false,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'
    })()

    const horas = Math.floor(exitData.minutos_totales / 60)
    const minutos = exitData.minutos_totales % 60
    const duracion = horas > 0 ? `${horas}h ${minutos}m` : `${minutos} minutos`

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ticket de Salida - ParkControl</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <!-- Header -->
            <tr>
              <td style="padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ParkControl</h1>
                <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">Sistema de Gestión de Parqueadero</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 24px; color: #1e293b; font-size: 24px; font-weight: 600;">Ticket de Salida</h2>
                <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                  Gracias por usar nuestro servicio. A continuación encontrás el resumen de tu visita:
                </p>
                
                <!-- Details Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Placa del Vehículo</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 20px; font-weight: 700; font-family: monospace;">${exitData.placa}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Hora de Ingreso</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${formattedEntrada}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Hora de Salida</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${formattedSalida}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <span style="color: #64748b; font-size: 14px;">Tiempo de Estacionamiento</span>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${duracion}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Total Amount -->
                <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Total a Pagar</p>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 36px; font-weight: 700;">$${exitData.valor_final.toLocaleString('es-CO')}</p>
                  ${exitData.descuento > 0 ? `<p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">Incluye descuento de $${exitData.descuento.toLocaleString('es-CO')}</p>` : ''}
                </div>
                
                <!-- Footer -->
                <p style="margin: 0; color: #94a3b8; font-size: 14px; text-align: center;">
                  Gracias por confiar en nosotros.<br>
                  ¡Te esperamos pronto!
                </p>
              </td>
            </tr>
            
            <!-- Bottom Bar -->
            <tr>
              <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  © 2024 ParkControl. Todos los derechos reservados.<br>
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

    const senderEmail = process.env.EMAIL_SENDER || process.env.EMAIL_FROM || 'no-reply@parkcontrol.example'
    if (smtpTransport) {
      await smtpTransport.sendMail({
        from: `ParkControl <${senderEmail}>`,
        to: email,
        subject: '🧾 Ticket de Salida - ParkControl',
        html
      })
    } else {
      const sendSmtpEmail = new SibApiV3Sdk.SendTransacEmail()
      sendSmtpEmail.sender = { name: 'ParkControl', email: senderEmail }
      sendSmtpEmail.to = [{ email }]
      sendSmtpEmail.subject = '🧾 Ticket de Salida - ParkControl'
      sendSmtpEmail.htmlContent = html

      await brevo.sendTransacEmail(sendSmtpEmail)
    }
    console.log('Email de salida enviado a:', email)
  } catch (error) {
    console.error('Error sending exit email:', error)
  }
}
