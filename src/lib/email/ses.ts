import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

export interface SendEmailInput {
  to: string | string[]
  subject: string
  text: string
  html?: string
  replyTo?: string
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; reason: 'missing_config' | 'send_failed' }

interface SesConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  fromEmail: string
  fromName?: string
  replyToEmail?: string
}

let cachedClient: SESv2Client | null = null

function loadConfig(): SesConfig | null {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const fromEmail = process.env.SES_FROM_EMAIL

  if (!region || !accessKeyId || !secretAccessKey || !fromEmail) {
    return null
  }

  return {
    region,
    accessKeyId,
    secretAccessKey,
    fromEmail,
    fromName: process.env.SES_FROM_NAME,
    replyToEmail: process.env.SES_REPLY_TO_EMAIL,
  }
}

function getClient(config: SesConfig): SESv2Client {
  if (cachedClient) return cachedClient
  cachedClient = new SESv2Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  return cachedClient
}

function buildFromAddress(config: SesConfig): string {
  if (config.fromName) {
    return `${config.fromName} <${config.fromEmail}>`
  }
  return config.fromEmail
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = loadConfig()
  if (!config) {
    console.warn(
      '[ses] missing AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / SES_FROM_EMAIL — email skipped',
    )
    return {
      ok: false,
      error: 'SES is not configured',
      reason: 'missing_config',
    }
  }

  const toAddresses = Array.isArray(input.to) ? input.to : [input.to]
  const replyTo = input.replyTo ?? config.replyToEmail

  const command = new SendEmailCommand({
    FromEmailAddress: buildFromAddress(config),
    Destination: { ToAddresses: toAddresses },
    Content: {
      Simple: {
        Subject: { Data: input.subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: input.text, Charset: 'UTF-8' },
          ...(input.html
            ? { Html: { Data: input.html, Charset: 'UTF-8' } }
            : {}),
        },
      },
    },
    ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
  })

  try {
    const client = getClient(config)
    const response = await client.send(command)
    return {
      ok: true,
      messageId: response.MessageId ?? '',
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown SES error'
    console.error('[ses] sendEmail failed', { to: toAddresses, error: message })
    return {
      ok: false,
      error: message,
      reason: 'send_failed',
    }
  }
}
