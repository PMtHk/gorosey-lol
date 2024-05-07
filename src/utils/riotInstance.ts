import axios from 'axios'

const { RIOT_API_KEY } = process.env

if (!RIOT_API_KEY) throw new Error('[ENV] RIOT_API_KEY를 불러올 수 없습니다.')

export const riotInstance = {
  // asia
  asia: axios.create({
    baseURL: 'https://asia.api.riotgames.com',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  }),

  // kr
  kr: axios.create({
    baseURL: 'https://kr.api.riotgames.com',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  }),
}
