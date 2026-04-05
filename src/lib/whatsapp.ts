export type WaTextMessage = {
  to: string
  text: string
  imageUrl?: string
  flyerLink?: string
}

export type WaSendResult = {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  apiVersion: string,
  msg: WaTextMessage
): Promise<WaSendResult> {
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`

  // If there's an image, send as image + caption
  if (msg.imageUrl) {
    const body = {
      messaging_product: 'whatsapp',
      to: msg.to,
      type: 'image',
      image: {
        link: msg.imageUrl,
        caption: msg.flyerLink ? `${msg.text}\n\n${msg.flyerLink}` : msg.text,
      },
    }
    return sendRequest(url, accessToken, body)
  }

  // Text only
  const body = {
    messaging_product: 'whatsapp',
    to: msg.to,
    type: 'text',
    text: {
      body: msg.flyerLink ? `${msg.text}\n\n${msg.flyerLink}` : msg.text,
    },
  }
  return sendRequest(url, accessToken, body)
}

async function sendRequest(
  url: string,
  accessToken: string,
  body: object
): Promise<WaSendResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message ?? `HTTP ${res.status}`,
      }
    }

    const messageId = data?.messages?.[0]?.id as string | undefined
    return { success: true, messageId }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
