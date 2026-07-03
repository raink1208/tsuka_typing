import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import game    from './routes/game'
import ranking from './routes/ranking'

const app = new Hono()

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'

app.use('*', logger())
app.use('*', cors({
  origin: corsOrigin,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 600,
}))

app.route('/api/game',    game)
app.route('/api/ranking', ranking)

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))

app.notFound((c) => c.json({ error: 'NOT_FOUND' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'INTERNAL_SERVER_ERROR' }, 500)
})

const port = parseInt(process.env.PORT ?? '3001', 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`tsuka-typing backend running on http://localhost:${info.port}`)
})
