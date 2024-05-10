import createRiotInstance from './riotInstance'

describe('riotInstance', () => {
  it('riotInstance', () => {
    const { asia, kr } = createRiotInstance('RGTEST_12123434')

    expect(asia.defaults.baseURL).toBe('https://asia.api.riotgames.com')
    expect(asia.defaults.headers['X-Riot-Token']).toBe('RGTEST_12123434')

    expect(kr.defaults.baseURL).toBe('https://kr.api.riotgames.com')
    expect(kr.defaults.headers['X-Riot-Token']).toBe('RGTEST_12123434')
  })
})
