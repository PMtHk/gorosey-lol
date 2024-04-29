import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema({
  _id: { type: String },
  watchList: [
    {
      type: String,
      ref: 'Summoner',
    },
  ],
  lastUpdatedAt: { type: Date, default: Date.now },
})

let Channel = null

if (mongoose.models.Channel !== undefined) {
  Channel = mongoose.models.Channel
} else {
  Channel = mongoose.model('Channel', channelSchema)
}

export default Channel
