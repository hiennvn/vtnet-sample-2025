// User related types

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  active: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UserCreateRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  roleIds: number[];
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  roleIds?: number[];
  active?: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  username: string;
  active: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface UserSearchParams {
  query: string;
  page: number;
  size: number;
}

export interface UserFetchParams {
  page: number;
  size: number;
} 