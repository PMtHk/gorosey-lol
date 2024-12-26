import mongoose from 'mongoose'

export interface IChannel {
  _id: string
  textChannel: string
  watchList: string[]
  lastUpdatedAt: Date
}

const channelSchema = new mongoose.Schema<IChannel>({
  // 디스코드 채널을 guild_id로 구분
  _id: { type: String },

  // 고로시롤이 메세지를 보낼 텍스트 채널과
  // 감시할 소환사 목록
  textChannel: { type: String, required: true },
  watchList: [{ type: String, ref: 'Summoner' }],

  // 채널의 마지막 업데이트 시간 (필요성 낮음)
  lastUpdatedAt: { type: Date, default: Date.now },
})

let Channel = null

if (mongoose.models.Channel !== undefined) {
  Channel = mongoose.models.Channel
} else {
  Channel = mongoose.model<IChannel>('Channel', channelSchema)
}

export default Channel
