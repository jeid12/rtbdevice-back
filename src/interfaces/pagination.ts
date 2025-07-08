export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function validatePaginationOptions(options: PaginationOptions): Required<PaginationOptions> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(Math.max(1, options.limit || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'DESC';

    return { page, limit, sortBy, sortOrder };
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
        data,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}
