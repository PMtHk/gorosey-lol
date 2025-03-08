export interface RequestConfig {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

export interface HttpClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}
