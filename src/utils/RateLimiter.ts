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
    this.timestamps = this.timestamps.filter(
      (timestamp) => Date.now() - timestamp < this.throttleDuration,
    )
  }

  private shouldThrottle() {
    this.gc()
    if (this.runningMode === RateLimiterMode.NORMAL) {
      return this.timestamps.length >= this.throttleLimit
    } else {
      return this.timestamps.length > this.throttleLimit * this.threshold
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      this.gc()

      if (this.timestamps.length < this.throttleLimit) {
        const request = this.requestQueue.shift()
        if (request) {
          this.timestamps.push(Date.now())
          await request()
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, this.throttleDuration / this.throttleLimit),
      )
    }

    this.isProcessingQueue = false
  }

  public async execute<T>(request: () => Promise<T>) {
    const shouldThrottle = this.shouldThrottle()

    if (shouldThrottle && this.runningMode === RateLimiterMode.NORMAL) {
      this.runningMode = RateLimiterMode.THROTTLE
      console.log('Throttling...')
    }

    if (!shouldThrottle && this.runningMode === RateLimiterMode.THROTTLE) {
      this.runningMode = RateLimiterMode.NORMAL
      console.log('Throttle released')
    }

    if (this.runningMode === RateLimiterMode.THROTTLE) {
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            resolve(await request())
          } catch (error) {
            reject(error)
          }
        })

        this.processQueue()
      })
    }

    this.timestamps.push(Date.now())
    return request()
  }
}
