// Project member related types

export interface ProjectMember {
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
  addedAt: string;
}

export interface ProjectMemberCreate {
  userId: number;
  role: string;
}

export interface ProjectMemberUpdate {
  role: string;
}

export interface ProjectMemberFetchParams {
  projectId: number;
}

export interface ProjectMemberResponse {
  members: ProjectMember[];
} 