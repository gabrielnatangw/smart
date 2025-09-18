export interface HelpCenterThemeDTO {
  theme_id: string;
  title: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  videos?: HelpCenterVideoDTO[];
  applications?: HelpCenterThemeApplicationDTO[];
}

export interface CreateHelpCenterThemeDTO {
  title: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order?: number;
  application_ids?: string[];
}

export interface UpdateHelpCenterThemeDTO {
  title?: string;
  description?: string;
  icon_name?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
  application_ids?: string[];
}

export interface HelpCenterThemeApplicationDTO {
  theme_application_id: string;
  theme_id: string;
  application_id: string;
  created_at: Date;
  application?: {
    application_id: string;
    name: string;
    displayName: string;
  };
}

export interface HelpCenterVideoDTO {
  video_id: string;
  title: string;
  description?: string;
  video_platform: string;
  external_video_id: string;
  external_url: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  theme_id: string;
  applications?: HelpCenterVideoApplicationDTO[];
}

export interface CreateHelpCenterVideoDTO {
  title: string;
  description?: string;
  video_platform: string;
  external_video_id: string;
  external_url: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order?: number;
  is_featured?: boolean;
  theme_id: string;
  application_ids?: string[];
}

export interface UpdateHelpCenterVideoDTO {
  title?: string;
  description?: string;
  video_platform?: string;
  external_video_id?: string;
  external_url?: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  application_ids?: string[];
}

export interface HelpCenterVideoApplicationDTO {
  video_application_id: string;
  video_id: string;
  application_id: string;
  created_at: Date;
  application?: {
    application_id: string;
    name: string;
    displayName: string;
  };
}

export interface HelpCenterUserViewDTO {
  view_id: string;
  user_id: string;
  video_id: string;
  viewed_at: Date;
  watch_duration?: number;
  completed: boolean;
}

export interface CreateHelpCenterUserViewDTO {
  user_id: string;
  video_id: string;
  watch_duration?: number;
  completed?: boolean;
}

export interface UpdateHelpCenterUserViewDTO {
  user_id?: string;
  watch_duration?: number;
  completed?: boolean;
}

export interface HelpCenterSearchDTO {
  search_id: string;
  user_id?: string;
  search_term: string;
  results_count: number;
  searched_at: Date;
}

export interface CreateHelpCenterSearchDTO {
  user_id?: string;
  search_term: string;
  results_count: number;
}

export interface HelpCenterSearchResultDTO {
  search_term: string;
  count: number;
}

export interface HelpCenterVideoSearchDTO {
  video_id: string;
  title: string;
  description?: string;
  video_platform: string;
  external_video_id: string;
  external_url: string;
  thumbnail_url?: string;
  duration?: number;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  theme_id: string;
  theme?: {
    theme_id: string;
    title: string;
    icon_name?: string;
    color?: string;
  };
  applications?: HelpCenterVideoApplicationDTO[];
}
