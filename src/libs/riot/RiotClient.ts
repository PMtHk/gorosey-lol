import { HttpClient } from '../http'
import { RiotErrorDto } from './types'
import { isRiotErrorDto, RiotApiError } from './error'

export class RiotClient {
  private http: HttpClient

  constructor(
    protected readonly baseURL: string,
    apiKey: string,
  ) {
    this.http = new HttpClient({
      baseURL,
      headers: {
        'X-Riot-Token': apiKey,
      },
    })
  }

  private readonly requestHandlers = {
    get: <T>(url: string) => this.http.get<T | RiotErrorDto>(url),
    post: <T>(url: string, data?: unknown) =>
      this.http.post<T | RiotErrorDto>(url, data),
  } as const

  private async request<T>(
    method: 'get' | 'post',
    url: string,
    data?: unknown,
  ): Promise<T> {
    const response = await this.requestHandlers[method](url, data)

    if (isRiotErrorDto(response)) {
      throw new RiotApiError(
        response.status.message,
        response.status.status_code,
        response,
      )
    }

    return response as T
  }

  public async get<T>(url: string): Promise<T> {
    return this.request<T>('get', url)
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('post', url, data)
  }
}
