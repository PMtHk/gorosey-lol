import { elapsedTime } from './elapsedTime'

describe.each([
  [Date.now() - 1000 * 30, '방금 전'],
  [Date.now() - 1000 * 59, '방금 전'],

  [Date.now() - 1000 * 60 * 2, '2분 전'],
  [Date.now() - 1000 * 60 * 59, '59분 전'],

  [Date.now() - 1000 * 60 * 60 * 3, '3시간 전'],
  [Date.now() - 1000 * 60 * 60 * 23, '23시간 전'],

  [Date.now() - 1000 * 60 * 60 * 24 * 3, '3일 전'],
  [Date.now() - 1000 * 60 * 60 * 24 * 6, '6일 전'],

  [Date.now() - 1000 * 60 * 60 * 24 * 7, '1주 전'],
  [Date.now() - 1000 * 60 * 60 * 24 * 7 * 2, '2주 전'],
  [Date.now() - 1000 * 60 * 60 * 24 * 7 * 3, '3주 전'],
])('elapsedTime', (time, expected) => {
  it(`returns ${expected} when time is ${time}`, () => {
    // Arrange
    // Act
    const result = elapsedTime(time)

    // Assert
    expect(result).toBe(expected)
  })
})
