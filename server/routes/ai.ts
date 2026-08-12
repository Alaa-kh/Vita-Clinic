import { Router } from 'express'
import { z } from 'zod'
import { getDb } from '../data/db.js'
import { optionalAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const aiRouter = Router()

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(['en', 'ar']).optional(),
})

function localAiReply(message: string, locale: 'en' | 'ar'): string {
  const q = message.toLowerCase()
  if (/(book|حجز|موعد)/.test(q)) {
    return locale === 'ar'
      ? 'يمكنك الحجز من صفحة الحجوزات أو اختيار باقة ثم تحديد اليوم والوقت المتاح.'
      : 'You can book from the Bookings page or open a package and pick an available slot.'
  }
  if (/(map|فرع|فرع|location|موقع)/.test(q)) {
    return locale === 'ar'
      ? 'افتح الخرائط لرؤية الفروع، التجميع، والمسافات والتتبع المباشر.'
      : 'Open Maps for branches, clustering, distance matrix, and live tracking.'
  }
  if (/(pay|دفع|stripe|فاتورة)/.test(q)) {
    return locale === 'ar'
      ? 'المدفوعات تدعم Stripe وApple Pay وGoogle Pay وPayPal مع الفواتير والاسترجاع.'
      : 'Payments support Stripe, Apple Pay, Google Pay, and PayPal with invoices and refunds.'
  }
  if (/(video|فيديو|مكالمة)/.test(q)) {
    return locale === 'ar'
      ? 'استخدم غرفة المكالمة للفيديو والصوت ومشاركة الشاشة عبر WebRTC.'
      : 'Use the call room for video, voice, and screen sharing over WebRTC.'
  }
  return locale === 'ar'
    ? 'أنا مساعد برق. اسأل عن الحجز، الخرائط، المدفوعات، أو الاستشارات عن بُعد.'
    : 'I am the BARQ assistant. Ask about booking, maps, payments, or telehealth.'
}

aiRouter.post('/chat', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const locale = parsed.data.locale ?? 'en'
  const openAiKey = process.env.OPENAI_API_KEY

  if (openAiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are BARQ assistant. Be concise, helpful, and clinical-friendly. Never invent medical diagnoses.',
            },
            { role: 'user', content: parsed.data.message },
          ],
          temperature: 0.4,
        }),
      })
      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>
        }
        const reply = data.choices?.[0]?.message?.content
        if (reply) {
          res.json({ reply, provider: 'openai', recommendations: recommend(parsed.data.message) })
          return
        }
      }
    } catch (error) {
      console.error('OpenAI failed, using local AI', error)
    }
  }

  res.json({
    reply: localAiReply(parsed.data.message, locale),
    provider: 'local',
    recommendations: recommend(parsed.data.message),
  })
})

function recommend(message: string) {
  const db = getDb()
  const q = message.toLowerCase()
  const categoryHint = /(food|pizza|meal|أكل|طعام)/.test(q)
    ? 'food'
    : /(grocery|mart|بقالة)/.test(q)
      ? 'grocery'
      : /(tech|earbud|watch|إلكترون)/.test(q)
        ? 'electronics'
        : null

  return db.products
    .filter((c) => (categoryHint ? c.category === categoryHint : c.featured))
    .slice(0, 3)
    .map((c) => ({ id: c.id, title: c.title, price: c.price, currency: c.currency }))
}

aiRouter.post('/search', (req, res) => {
  const schema = z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(20).optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const q = parsed.data.query.toLowerCase()
  const limit = parsed.data.limit ?? 8
  const items = getDb()
    .products.map((c) => {
      const hay = `${c.title} ${c.description} ${c.tags.join(' ')} ${c.city} ${c.category}`.toLowerCase()
      const score =
        (hay.includes(q) ? 5 : 0) +
        q.split(/\s+/).reduce((acc, token) => acc + (hay.includes(token) ? 1 : 0), 0)
      return { care: c, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ care, score }) => ({
      id: care.id,
      title: care.title,
      city: care.city,
      specialty: care.category,
      price: care.price,
      currency: care.currency,
      score,
    }))

  res.json({ items, mode: 'semantic-lite' })
})

aiRouter.post('/ocr', (req, res) => {
  const schema = z.object({ textHint: z.string().optional(), imageName: z.string().optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }
  res.json({
    text: parsed.data.textHint ?? 'Patient ID · BARQ · Appointment voucher sample OCR text',
    confidence: 0.91,
    provider: process.env.OCR_PROVIDER ?? 'mock',
    imageName: parsed.data.imageName ?? null,
  })
})

aiRouter.post('/speech/transcribe', (req, res) => {
  const schema = z.object({ audioLabel: z.string().optional(), locale: z.enum(['en', 'ar']).optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }
  res.json({
    text:
      parsed.data.locale === 'ar'
        ? 'أريد حجز موعد لتبييض الأسنان يوم السبت'
        : 'I want to book a teeth whitening appointment on Saturday',
    confidence: 0.88,
    provider: 'voice-to-text',
  })
})

aiRouter.post('/speech/synthesize', (req, res) => {
  const schema = z.object({ text: z.string().min(1).max(500) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }
  res.json({
    audioUrl: null,
    mimeType: 'audio/mpeg',
    note: 'Wire ElevenLabs/OpenAI TTS with API keys for real audio bytes',
    text: parsed.data.text,
    provider: 'text-to-speech',
  })
})

aiRouter.post('/vision', (req, res) => {
  const schema = z.object({ label: z.string().optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }
  res.json({
    labels: ['clinic', 'dental chair', 'smile'],
    objects: [{ name: 'person', confidence: 0.86 }],
    provider: 'image-recognition',
    input: parsed.data.label ?? null,
  })
})
