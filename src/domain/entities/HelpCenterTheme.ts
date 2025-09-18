export class HelpCenterTheme {
  constructor(
    public readonly theme_id: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly icon_name?: string,
    public readonly color?: string,
    public readonly sort_order: number = 0,
    public readonly is_active: boolean = true,
    public readonly created_at: Date = new Date(),
    public readonly updated_at?: Date,
    public readonly deleted_at?: Date,
    public readonly videos?: HelpCenterVideo[],
    public readonly applications?: HelpCenterThemeApplication[]
  ) {}

  static create(
    title: string,
    description?: string,
    icon_name?: string,
    color?: string,
    sort_order: number = 0
  ): HelpCenterTheme {
    return new HelpCenterTheme(
      crypto.randomUUID(),
      title,
      description,
      icon_name,
      color,
      sort_order
    );
  }

  update(
    title?: string,
    description?: string,
    icon_name?: string,
    color?: string,
    sort_order?: number,
    is_active?: boolean
  ): HelpCenterTheme {
    return new HelpCenterTheme(
      this.theme_id,
      title ?? this.title,
      description ?? this.description,
      icon_name ?? this.icon_name,
      color ?? this.color,
      sort_order ?? this.sort_order,
      is_active ?? this.is_active,
      this.created_at,
      new Date(),
      this.deleted_at,
      this.videos,
      this.applications
    );
  }

  softDelete(): HelpCenterTheme {
    return new HelpCenterTheme(
      this.theme_id,
      this.title,
      this.description,
      this.icon_name,
      this.color,
      this.sort_order,
      this.is_active,
      this.created_at,
      this.updated_at,
      new Date(),
      this.videos,
      this.applications
    );
  }
}

export class HelpCenterVideo {
  constructor(
    public readonly video_id: string,
    public readonly title: string,
    public readonly video_platform: VideoPlatform,
    public readonly external_video_id: string,
    public readonly external_url: string,
    public readonly theme_id: string,
    public readonly description?: string,
    public readonly thumbnail_url?: string,
    public readonly duration?: number,
    public readonly sort_order: number = 0,
    public readonly is_active: boolean = true,
    public readonly is_featured: boolean = false,
    public readonly created_at: Date = new Date(),
    public readonly updated_at?: Date,
    public readonly deleted_at?: Date,
    public readonly user_views?: HelpCenterUserView[],
    public readonly applications?: HelpCenterVideoApplication[]
  ) {}

  static create(
    title: string,
    theme_id: string,
    video_platform: VideoPlatform,
    external_video_id: string,
    external_url: string,
    description?: string,
    thumbnail_url?: string,
    duration?: number,
    sort_order?: number,
    is_featured?: boolean
  ): HelpCenterVideo {
    return new HelpCenterVideo(
      crypto.randomUUID(),
      title,
      video_platform,
      external_video_id,
      external_url,
      theme_id,
      description,
      thumbnail_url,
      duration,
      sort_order || 0,
      true,
      is_featured || false,
      new Date(),
      undefined,
      undefined
    );
  }

  update(
    title?: string,
    description?: string,
    video_platform?: VideoPlatform,
    external_video_id?: string,
    external_url?: string,
    thumbnail_url?: string,
    duration?: number,
    sort_order?: number,
    is_active?: boolean,
    is_featured?: boolean
  ): HelpCenterVideo {
    return new HelpCenterVideo(
      this.video_id,
      title ?? this.title,
      video_platform ?? this.video_platform,
      external_video_id ?? this.external_video_id,
      external_url ?? this.external_url,
      this.theme_id,
      description ?? this.description,
      thumbnail_url ?? this.thumbnail_url,
      duration ?? this.duration,
      sort_order ?? this.sort_order,
      is_active ?? this.is_active,
      is_featured ?? this.is_featured,
      this.created_at,
      new Date(),
      this.deleted_at,
      this.user_views,
      this.applications
    );
  }

  softDelete(): HelpCenterVideo {
    return new HelpCenterVideo(
      this.video_id,
      this.title,
      this.video_platform,
      this.external_video_id,
      this.external_url,
      this.theme_id,
      this.description,
      this.thumbnail_url,
      this.duration,
      this.sort_order,
      this.is_active,
      this.is_featured,
      this.created_at,
      this.updated_at,
      new Date(),
      this.user_views,
      this.applications
    );
  }
}

export class HelpCenterThemeApplication {
  constructor(
    public readonly theme_application_id: string,
    public readonly theme_id: string,
    public readonly application_id: string,
    public readonly created_at: Date = new Date()
  ) {}

  static create(
    theme_id: string,
    application_id: string
  ): HelpCenterThemeApplication {
    return new HelpCenterThemeApplication(
      crypto.randomUUID(),
      theme_id,
      application_id
    );
  }
}

export class HelpCenterVideoApplication {
  constructor(
    public readonly video_application_id: string,
    public readonly video_id: string,
    public readonly application_id: string,
    public readonly created_at: Date = new Date()
  ) {}

  static create(
    video_id: string,
    application_id: string
  ): HelpCenterVideoApplication {
    return new HelpCenterVideoApplication(
      crypto.randomUUID(),
      video_id,
      application_id
    );
  }
}

export class HelpCenterUserView {
  constructor(
    public readonly view_id: string,
    public readonly user_id: string,
    public readonly video_id: string,
    public readonly viewed_at: Date = new Date(),
    public readonly watch_duration?: number,
    public readonly completed: boolean = false
  ) {}

  static create(
    user_id: string,
    video_id: string,
    watch_duration?: number,
    completed: boolean = false
  ): HelpCenterUserView {
    return new HelpCenterUserView(
      crypto.randomUUID(),
      user_id,
      video_id,
      new Date(),
      watch_duration,
      completed
    );
  }

  update(watch_duration?: number, completed?: boolean): HelpCenterUserView {
    return new HelpCenterUserView(
      this.view_id,
      this.user_id,
      this.video_id,
      this.viewed_at,
      watch_duration ?? this.watch_duration,
      completed ?? this.completed
    );
  }
}

export class HelpCenterSearch {
  constructor(
    public readonly search_id: string,
    public readonly search_term: string,
    public readonly results_count: number,
    public readonly user_id?: string,
    public readonly searched_at: Date = new Date()
  ) {}

  static create(
    search_term: string,
    results_count: number,
    user_id?: string
  ): HelpCenterSearch {
    return new HelpCenterSearch(
      crypto.randomUUID(),
      search_term,
      results_count,
      user_id
    );
  }
}

export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  VIMEO = 'VIMEO',
  DAILYMOTION = 'DAILYMOTION',
  CUSTOM = 'CUSTOM',
}
