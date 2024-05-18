import axios from 'axios'
import createRiotInstance from './riotInstance'

jest.mock('axios')

describe('createRiotInstance', () => {
  const RIOT_API_KEY = 'RGTEST_12123434'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create axios instance with correct baseURLs and headers', () => {
    // Arrange
    // Act
    const { asia, kr } = createRiotInstance(RIOT_API_KEY)

    // Assert
    expect(axios.create).toHaveBeenCalledTimes(2)
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://asia.api.riotgames.com',
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    })
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://kr.api.riotgames.com',
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    })
    expect(asia).toEqual(axios.create())
    expect(kr).toEqual(axios.create())
  })
})
