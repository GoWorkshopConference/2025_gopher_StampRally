// Swagger定義から生成された型定義

export interface User {
    id: number;
    name: string;
    twitter_id?: string;
    favorite_go_feature?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserCreateRequest {
    name: string;
    twitter_id?: string;
    favorite_go_feature?: string;
    icon?: string;
}

export interface UserUpdateRequest {
    name?: string;
    twitter_id?: string;
    favorite_go_feature?: string;
    icon?: string;
}

export interface UserFilterRequest {
    page?: number;
    page_size?: number;
}

export interface Pagination {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next?: boolean;
    has_previous?: boolean;
}

export interface UserFilterResponse {
    users: User[];
    pagination: Pagination;
}

export interface Stamp {
    id: number;
    name: string;
    image: string;
    created_at?: string;
    updated_at?: string;
}

export interface StampCreateRequest {
    name: string;
    image: string;
}

export interface StampUpdateRequest {
    name?: string;
    image?: string;
}

export interface StampListResponse {
    stamps: Stamp[];
    total: number;
}

export interface UserStamp {
    user_id: number;
    stamp_id: number;
    acquired_at?: string;
}

export interface UserStampListResponse {
    stamps: UserStamp[];
}

export interface AcquireStampRequest {
    stamp_id: number;
}

export interface UserDetail extends User {
    acquired_stamps?: UserStamp[];
}

export interface ApiError {
    code: string;
    message: string;
    details?: string;
}

export interface ErrorResponse {
    error: string;
}

