import mongoose from 'mongoose'
import { IChannel } from './Channel'

export interface ISchedule {
  _id: string
  guildId: string // acutally guildId
  time: string
}
export interface ISchedulePopulated {
  _id: string
  guildId: IChannel
  time: string
}

const scheduleSchema = new mongoose.Schema<ISchedule>({
  _id: { type: String },

  // 디스코드 채널 = guild
  guildId: { type: String, required: true, ref: 'Channel' },
  time: { type: String, required: true },
})

let Schedule = null

if (mongoose.models.Schedule !== undefined) {
  Schedule = mongoose.models.Schedule
} else {
  Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema)
}

export default Schedule
