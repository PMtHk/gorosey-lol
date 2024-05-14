import 'reflect-metadata'

import express from 'express'
import { initBot } from './bot'

const app = express()

app.get('/health', (req, res) => {
  res.send({
    status: 'ok',
    timestamp: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    }),
  })
})

app.listen(8000, () => {
  console.log('GoroseyBot Server is running on port 8000')
})

initBot()
