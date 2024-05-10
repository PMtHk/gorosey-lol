import { elapsedTime } from './elapsedTime'

describe('elapsedTime', () => {
  it('less than 60 seconds', () => {
    expect(elapsedTime(Date.now() - 1000 * 30)).toBe('방금 전')
    expect(elapsedTime(Date.now() - 1000 * 30)).not.toBe('1분 전')
    expect(elapsedTime(Date.now() - 1000 * 59)).toBe('방금 전')
    expect(elapsedTime(Date.now() - 1000 * 59)).not.toBe('1분전')
    expect(elapsedTime(Date.now() - 1000 * 61)).not.toBe('방금 전')
  })

  it('less than 60 minutes', () => {
    expect(elapsedTime(Date.now() - 1000 * 60 * 2)).toBe('2분 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 2)).not.toBe('방금 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 59)).toBe('59분 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 59)).not.toBe('1시간 전')
  })

  it('less than 24 hours', () => {
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 3)).toBe('3시간 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 3)).not.toBe('3분 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 23)).toBe('23시간 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 23)).not.toBe('1일 전')
  })

  it('less than 7 days', () => {
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 3)).toBe('3일 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 3)).not.toBe(
      '3시간 전',
    )
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 6)).toBe('6일 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 6)).not.toBe('1주 전')
  })

  it('less than 4 weeks', () => {
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7)).toBe('1주 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7)).not.toBe('7일 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7 * 3)).toBe('3주 전')
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7 * 3)).not.toBe(
      '1개월 전',
    )
  })

  it('more than 4 weeks', () => {
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 * 5)
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7 * 5)).toBe(
      `${date.toLocaleDateString('ko-KR')}`,
    )

    const date2 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 * 3)
    expect(elapsedTime(Date.now() - 1000 * 60 * 60 * 24 * 7 * 3)).not.toBe(
      `${date2.toLocaleDateString('ko-KR')}`,
    )
  })
})
