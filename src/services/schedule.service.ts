import { Service } from 'typedi'
import ScheduleRepository from '../repositories/schedule.repo'
import { ISchedulePopulated } from '../models/schedule.model'

@Service()
export default class ScheduleService {
  constructor(private scheduleRepository: ScheduleRepository) {}

  public getSchedules(time?: string): Promise<ISchedulePopulated[]> {
    return this.scheduleRepository.findAll(time)
  }

  public createSchedules(
    params: Array<{
      guildId: string
      time: string
    }>,
  ): Promise<void> {
    return this.scheduleRepository.createMany(params)
  }

  public deleteSchedules(guildId: string): Promise<void> {
    return this.scheduleRepository.deleteMany(guildId)
  }
}
