enum RateLimiterMode {
  NORMAL = 'NORMAL',
  THROTTLE = 'THROTTLE',
}

export class RateLimiter {
  private requestQueue: Array<() => Promise<unknown>> = []

  private isProcessingQueue = false

  private timestamps: Array<number> = []

  private runningMode: RateLimiterMode = RateLimiterMode.NORMAL

  constructor(
    private readonly throttleLimit: number = 500,
    private readonly throttleDuration: number = 10000,
    private readonly threshold: number = 0.8,
  ) {}

  private gc() {
    const now = Date.now()
    this.timestamps = this.timestamps.filter(
      (timestamp) => now - timestamp < this.throttleDuration,
    )
  }

  private shouldThrottle() {
    this.gc()
    if (this.runningMode === RateLimiterMode.NORMAL) {
      return this.timestamps.length >= this.throttleLimit
    }
    return this.timestamps.length > this.throttleLimit * this.threshold
  }

  private async processQueue() {
    if (this.isProcessingQueue) {
      return
    }

    this.isProcessingQueue = true
    const interval = this.throttleDuration / this.throttleLimit

    try {
      while (this.requestQueue.length > 0) {
        this.gc()

        if (this.timestamps.length < this.throttleLimit) {
          const request = this.requestQueue.shift()
          if (request) {
            const startTime = Date.now()
            this.timestamps.push(startTime)
            await request()
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, interval))
        }
      }
    } finally {
      this.isProcessingQueue = false
    }
  }

  public execute<T>(request: () => Promise<T>): Promise<T> {
    if (this.shouldThrottle()) {
      this.runningMode = RateLimiterMode.THROTTLE
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            const result = await request()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
        this.processQueue().catch(reject)
      })
    }

    this.timestamps.push(Date.now())
    return request()
  }
}
