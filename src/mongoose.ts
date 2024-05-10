import mongoose from 'mongoose'
import { DatabaseError } from './errors/DatabaseError'
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
    throw new DatabaseError(
      'Cannot connect to remote database. : ' + error.message,
    )
  }
}

export const dbDisconnect = async () => {
  if (!isConnected) return

  try {
    await mongoose.disconnect()

    isConnected = false
  } catch (error) {
    throw new DatabaseError('cannot disconnect to remote database. : ' + error)
  }
}
