import mongoose from 'mongoose'

const { MONGODB_URI, MONGODB_DBNAME } = process.env

if (!MONGODB_URI) throw new Error('MONGO_URI must be defined')
if (!MONGODB_DBNAME) throw new Error('MONGO_DB_NAME must be defined')

let isConnected: boolean = false

export const dbConnect = async () => {
  mongoose.set('strictQuery', true)

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
