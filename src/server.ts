import 'reflect-metadata'
import express, { Request, Response, NextFunction } from 'express'
import { initBot } from './bot'

const PORT = parseInt(process.env.PORT) || 8000

const STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const

const MESSAGE = {
  OK: '서버가 정상적으로 작동 중입니다.',
  INTERNAL_SERVER_ERROR: '서버에 문제가 발생했습니다.',
} as const

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short',
}

function createServer() {
  const app = express()

  app.get('/health', (req, res) => {
    const response = {
      status: STATUS.OK,
      message: MESSAGE.OK,
      timestamp: new Date().toLocaleString('ko-KR', { ...TIMESTAMP_OPTIONS }),
    }

    res.status(200).json(response)
  })

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)

    res.status(500).send({
      status: STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGE.INTERNAL_SERVER_ERROR,
    })
  })

  return app
}

function startServer(port: number = PORT) {
  const app = createServer()

  try {
    app.listen(port, () => {
      initBot()
    })
  } catch (e) {
    console.error('[EXPRESS] 서버를 시작하는 중에 문제가 발생했습니다.')
  }
}

startServer()
