import mongoose from 'mongoose'

export interface IMatchHistory {
  _id: mongoose.Types.ObjectId

  matchId: string
  riotPuuid: string

  assists: number
  championName: string
  deaths: number
  gameEndTimestamp: number
  gameType: string
  kills: number
  position: string
  totalMinionsKilled: number
  visionScore: number
  win: boolean
}

const matchHistorySchema = new mongoose.Schema<IMatchHistory>({
  // object id는 자동으로 생성되지만, 사용하지 않을 예정이므로 주석 처리
  // _id: { type: mongoose.Schema.Types.ObjectId, required: true },

  // matchId와 라이엇 puuid로 구분
  matchId: { type: String, required: true },
  riotPuuid: { type: String, required: true },

  // 사용할 게임 내 정보 (abc 순)
  assists: { type: Number, required: true, default: 0 },
  championName: { type: String, required: true, default: '' },
  deaths: { type: Number, required: true, default: 0 },
  gameEndTimestamp: { type: Number, required: true, default: 0 },
  gameType: { type: String, required: true, default: '' },
  kills: { type: Number, required: true, default: 0 },
  position: { type: String, required: true, default: '' },
  // position의 경우 teamPosition과 individualPosition이 있고,
  // riot은 teamPosition을 우선으로 사용하고,
  // 없을 경우 individualPosition을 사용하기를 권장하고 있음
  totalMinionsKilled: { type: Number, required: true, default: 0 },
  visionScore: { type: Number, required: true, default: 0 },
  win: { type: Boolean, required: true, default: false },
})

let MatchHistory = null

if (mongoose.models.MatchHistory !== undefined) {
  MatchHistory = mongoose.models.MatchHistory
} else {
  MatchHistory = mongoose.model<IMatchHistory>(
    'MatchHistory',
    matchHistorySchema,
  )
}

export default MatchHistory
