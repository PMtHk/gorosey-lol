import { HttpError } from './error'
import { HttpClientConfig, RequestConfig } from './types'

const DEFAULT_TIMEOUT = 10000

export class HttpClient {
  constructor(private config: HttpClientConfig) {
    this.config.timeout = config.timeout ?? DEFAULT_TIMEOUT
  }

  async fetch<T>(path: string, config?: RequestConfig): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const url = this.getURL(path)

      const response = await fetch(url, {
        ...config,
        headers: {
          ...this.config.headers,
          ...config?.headers,
        },
        signal: controller.signal,
        body: config?.body ? JSON.stringify(config.body) : undefined,
      })

      return (await response.json()) as T
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new HttpError(
          `Request timeout after ${this.config.timeout}ms`,
          408,
        )
      }

      throw new HttpError(error.message, 500)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async get<T>(path: string, config?: Omit<RequestConfig, 'body'>): Promise<T> {
    return this.fetch(path, { ...config, method: 'GET' })
  }

  async post<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.fetch<T>(path, {
      ...config,
      method: 'POST',
      body,
    })
  }

  private getURL(path: string): string {
    return (
      this.config.baseURL.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
    )
  }
}
