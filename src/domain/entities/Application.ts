export interface Application {
  applicationId: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateApplicationRequest {
  name: string;
  displayName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateApplicationRequest {
  name?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface PaginatedApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationStatistics {
  totalApplications: number;
  activeApplications: number;
  deletedApplications: number;
  applicationsWithDescription: number;
  applicationsWithoutDescription: number;
}
