import mongoose from 'mongoose'
import { DatabaseError } from './errors/DatabaseError'
import * as dotenv from 'dotenv'

dotenv.config()

const ERRORS = {
  MONGODB_URI_MISSING: '[ENV] MONGODB_URI 가 정의되지 않았습니다.',
  MONGODB_DBNAME_MISSING: '[ENV] MONGODB_DBNAME 가 정의되지 않았습니다.',
  CONNECT_FAILED: '[DB] 데이터베이스와의 연결에 실패했습니다',
  DISCONNECT_FAILED: '[DB] 데이터베이스와의 연결을 해제하는데 실패했습니다',
  CONNECTION_ERROR: '[DB] 커넥션에 문제가 발생했습니다.',
} as const

const { MONGODB_URI, MONGODB_DBNAME } = process.env

if (!MONGODB_URI) {
  console.error(ERRORS.MONGODB_URI_MISSING)
  process.exit(1)
}

if (!MONGODB_DBNAME) {
  console.error(ERRORS.MONGODB_DBNAME_MISSING)
  process.exit(1)
}

let isConnected = false

const CONNECTION_OPTIONS = {
  dbName: MONGODB_DBNAME,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
} as const

mongoose.set('strictQuery', true)
mongoose.set('strictPopulate', false)

mongoose.connection.on('error', (error) => {
  console.error(ERRORS.CONNECTION_ERROR, error)
  isConnected = false
})

export async function dbConnect(): Promise<void> {
  if (isConnected) {
    return
  }

  try {
    await mongoose.connect(MONGODB_URI, CONNECTION_OPTIONS)
    isConnected = true
  } catch (error) {
    console.error(ERRORS.CONNECT_FAILED, error)
    throw new DatabaseError(ERRORS.CONNECT_FAILED)
  }
}

export async function dbDisconnect(): Promise<void> {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
  } catch (error) {
    console.error(ERRORS.DISCONNECT_FAILED, error)
    throw new DatabaseError(ERRORS.DISCONNECT_FAILED)
  }
}
