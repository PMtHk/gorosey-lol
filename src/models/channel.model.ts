import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema({
  _id: { type: String },
  channelId: { type: String, required: true },
  watchList: [
    {
      type: String,
      ref: 'Summoner',
    },
  ],
})

let Channel = null

if (mongoose.models.Channel !== undefined) {
  Channel = mongoose.models.Channel
} else {
  Channel = mongoose.model('Channel', channelSchema)
}

export default Channel
