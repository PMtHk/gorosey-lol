import mongoose from 'mongoose'
import DBError from './errors/DBError'
import * as dotenv from 'dotenv'

dotenv.config()

const { MONGODB_URI, MONGODB_DBNAME } = process.env

if (!MONGODB_URI) throw new Error('[ENV] MONGO_URI를 불러올 수 없습니다.')
if (!MONGODB_DBNAME)
  throw new Error('[ENV] MONGO_DB_NAME를 불러올 수 없습니다.')

let isConnected: boolean = false

export const dbConnect = async () => {
  mongoose.set('strictQuery', true)
  mongoose.set('strictPopulate', false)

  if (isConnected) return

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DBNAME,
    })

    isConnected = true
  } catch (error) {
    throw new DBError(500, 'dbConnect error')
  }
}

export const dbDisconnect = async () => {
  if (!isConnected) return

  try {
    await mongoose.disconnect()

    isConnected = false
  } catch (error) {
    throw new DBError(500, 'dbDisconnect error')
  }
}
