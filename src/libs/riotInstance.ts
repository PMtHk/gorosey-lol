import axios from 'axios'

const { RIOT_API_KEY } = process.env

if (!RIOT_API_KEY) throw new Error('[ENV] RIOT_API_KEY를 불러올 수 없습니다.')

export default function createRiotInstance(riotApiKey: string) {
  const asia = axios.create({
    baseURL: 'https://asia.api.riotgames.com',
    headers: {
      'X-Riot-Token': riotApiKey,
    },
  })

  const kr = axios.create({
    baseURL: 'https://kr.api.riotgames.com',
    headers: {
      'X-Riot-Token': riotApiKey,
    },
  })

  return { asia, kr }
}

export const riotInstance = createRiotInstance(RIOT_API_KEY)
