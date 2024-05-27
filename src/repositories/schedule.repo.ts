import { Service } from 'typedi'
import { dbConnect } from '../mongoose'
import Schedule, {
  ISchedule,
  ISchedulePopulated,
} from '../models/schedule.model'
import { DatabaseError } from '../errors/DatabaseError'

@Service()
export default class ScheduleRepository {
  public async findAll(time?: string): Promise<ISchedulePopulated[]> {
    try {
      await dbConnect()

      const schedules = await Schedule.find({
        ...(time && { time: time }),
      }).populate('guildId', 'textChannel watchList')

      return schedules
    } catch (error) {
      throw new DatabaseError(
        `ScheduleRepository.findAll() error: ${error.message}`,
      )
    }
  }

  public async find(guildId: string): Promise<ISchedule[]> {
    try {
      await dbConnect()

      const schedules = await Schedule.find({
        guildId,
      })

      return schedules
    } catch (error) {
      throw new DatabaseError(
        `ScheduleRepository.find() error: ${error.message}`,
      )
    }
  }

  public async create(guildId: string, time: string): Promise<void> {
    try {
      await dbConnect()

      await Schedule.create({
        guildId,
        time,
      })
    } catch (error) {
      throw new DatabaseError(
        `ScheduleRepository.create() error: ${error.message}`,
      )
    }
  }

  public async createMany(
    params: Array<{
      guildId: string
      time: string
    }>,
  ) {
    try {
      await dbConnect()

      await Schedule.insertMany(params)
    } catch (error) {
      throw new DatabaseError(
        `ScheduleRepository.createMany() error: ${error.message}`,
      )
    }
  }

  public async deleteMany(guildId: string): Promise<void> {
    try {
      await dbConnect()

      await Schedule.deleteMany({
        guildId,
      })
    } catch (error) {
      throw new DatabaseError(
        `ScheduleRepository.delete() error: ${error.message}`,
      )
    }
  }
}
