// APIクライアント

import type {
    AcquireStampRequest,
    Stamp,
    StampCreateRequest,
    StampListResponse,
    StampUpdateRequest,
    User,
    UserCreateRequest,
    UserDetail,
    UserFilterRequest,
    UserFilterResponse,
    UserStamp,
    UserStampListResponse,
    UserUpdateRequest,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.text();
            console.error('API Error Response:', errorBody);
            errorMessage += `\nResponse: ${errorBody}`;
        } catch (e) {
            console.error('Could not read error response body');
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

// User API
export const userAPI = {
    list: () => fetchAPI<User[]>('/users'),

    create: (data: UserCreateRequest) =>
        fetchAPI<User>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    get: (id: number) => fetchAPI<UserDetail>(`/users/${id}`),

    update: (id: number, data: UserUpdateRequest) =>
        fetchAPI<User>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    filter: (query?: string, request?: UserFilterRequest) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        return fetchAPI<UserFilterResponse>(`/users/filter${queryString}`, {
            method: 'POST',
            body: JSON.stringify(request || {}),
        });
    },
};

// Stamp API
export const stampAPI = {
    list: (limit = 100, offset = 0) => {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });
        return fetchAPI<StampListResponse>(`/stamps?${params.toString()}`);
    },

    create: (data: StampCreateRequest) =>
        fetchAPI<Stamp>('/stamps', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    get: (id: number) => fetchAPI<Stamp>(`/stamps/${id}`),

    update: (id: number, data: StampUpdateRequest) =>
        fetchAPI<Stamp>(`/stamps/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        fetch(`${API_BASE_URL}/stamps/${id}`, {
            method: 'DELETE',
        }),
};

// User Stamp API
export const userStampAPI = {
    list: (userId: number) => fetchAPI<UserStampListResponse>(`/users/${userId}/stamps`),

    acquire: (userId: number, data: AcquireStampRequest) =>
        fetchAPI<UserStamp>(`/users/${userId}/stamps`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

