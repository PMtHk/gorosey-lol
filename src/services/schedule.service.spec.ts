import { createMockedScheduleRepository } from '../mocks/schedule.repo.mock'
import ScheduleRepository from '../repositories/schedule.repo'
import ScheduleService from './schedule.service'

describe('ScheduleService', () => {
  let MockedScheduleRepository: ScheduleRepository
  let scheduleService: ScheduleService

  beforeEach(() => {
    MockedScheduleRepository = createMockedScheduleRepository()
    scheduleService = new ScheduleService(MockedScheduleRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getSchedules', () => {
    it('default', async () => {
      // Arrange
      // Act
      const schedules = await scheduleService.getSchedules('12')

      // Assert
      const allSameTime = schedules.every((elem) => elem.time === '12')
      expect(allSameTime).toBe(true)
    })
  })

  describe('createSchedule', () => {
    it('default', async () => {
      // Arrange
      // Act
      await scheduleService.createSchedules([
        {
          guildId: 'guildId_111',
          time: '12',
        },
        {
          guildId: 'guildId_111',
          time: '13',
        },
      ])

      // Assert
      expect(MockedScheduleRepository.createMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteSchedule', () => {
    it('default', async () => {
      // Arrange
      // Act
      await scheduleService.deleteSchedules('guildId_111')

      // Assert
      expect(MockedScheduleRepository.deleteMany).toHaveBeenCalledTimes(1)
    })
  })
})
