import { Service } from 'typedi'
import ScheduleRepository from '../repositories/schedule.repo'
import { ISchedulePopulated } from '../models/schedule.model'

@Service()
export default class ScheduleService {
  constructor(private scheduleRepository: ScheduleRepository) {}

  public async getSchedules(time?: string): Promise<ISchedulePopulated[]> {
    const schedules = await this.scheduleRepository.findAll(time)

    return schedules
  }

  public async createSchedules(
    params: Array<{
      guildId: string
      time: string
    }>,
  ): Promise<void> {
    await this.scheduleRepository.createMany(params)
  }

  public async deleteSchedules(guildId: string): Promise<void> {
    await this.scheduleRepository.deleteMany(guildId)
  }
}
