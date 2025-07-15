// Project related types

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  documentCount: number;
  createdAt: string;
}

export interface ProjectPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ProjectFetchParams {
  page: number;
  size: number;
  status?: string;
  name?: string;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string;
}

export interface ProjectUpdatePayload {
  name: string;
  description?: string;
  status: string;
}

export interface ProjectsResponse {
  content: Project[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
} 