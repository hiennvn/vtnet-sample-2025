// API response interfaces
export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// API error interfaces
export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
  timestamp?: string
  path?: string
}

// API pagination parameters
export interface ApiPaginationParams {
  page?: number
  size?: number
  sort?: string
}

// API search parameters
export interface ApiSearchParams extends ApiPaginationParams {
  query?: string
}

// API filter parameters
export interface ApiFilterParams extends ApiPaginationParams {
  [key: string]: any
} 