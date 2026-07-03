import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Bindings } from './bindings'
import game    from './routes/game'
import ranking from './routes/ranking'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', cors({
  origin: (_origin, c) => c.env.CORS_ORIGIN ?? 'http://localhost:3000',
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

export default app

