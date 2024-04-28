import mongoose from 'mongoose'

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
    console.error('Error connecting to database', error)
  }
}

export const dbDisconnect = async () => {
  if (!isConnected) return

  try {
    await mongoose.disconnect()

    isConnected = false
  } catch (error) {
    console.error('Error disconnecting from database', error)
  }
}
