import { Service } from 'typedi'
import Schedule, { ISchedule, ISchedulePopulated } from '../models/Schedule'

@Service()
export class ScheduleRepository {
  public async findAll(time?: string): Promise<ISchedulePopulated[]> {
    return Schedule.find({
      ...(time && { time: time }),
    }).populate('guildId', 'textChannel watchList')
  }

  public find(guildId: string): Promise<ISchedule[]> {
    return Schedule.find({
      guildId,
    })
  }

  public create(guildId: string, time: string): Promise<ISchedule> {
    return Schedule.create({
      guildId,
      time,
    })
  }

  public async createMany(
    params: Array<{
      guildId: string
      time: string
    }>,
  ): Promise<ISchedule[]> {
    return Schedule.insertMany(params)
  }

  public async deleteMany(guildId: string): Promise<ISchedule[]> {
    return Schedule.deleteMany({
      guildId,
    })
  }
}
