# Pagination Implementation Guide

## Overview

This document describes the pagination implementation for the RTB Device Management Backend API. Pagination has been implemented across all major endpoints to improve performance and user experience when dealing with large datasets.

## Common Pagination Interface

### PaginationOptions Interface

```typescript
interface PaginationOptions {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 10, max: 100)
  sortBy?: string; // Field to sort by (default: 'createdAt')
  sortOrder?: "ASC" | "DESC"; // Sort order (default: 'DESC')
}
```

### PaginatedResponse Interface

```typescript
interface PaginatedResponse<T> {
  data: T[]; // Array of items
  pagination: {
    currentPage: number; // Current page number
    pageSize: number; // Number of items per page
    totalItems: number; // Total number of items
    totalPages: number; // Total number of pages
    hasNextPage: boolean; // Whether there's a next page
    hasPreviousPage: boolean; // Whether there's a previous page
  };
}
```

### Constants

- `DEFAULT_PAGE_SIZE = 10` - Default number of items per page
- `MAX_PAGE_SIZE = 100` - Maximum allowed items per page

## API Endpoints with Pagination

### 1. Applications

#### GET /api/applications

Retrieve all applications with optional filtering and pagination.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Field to sort by (default: 'createdAt')
- `sortOrder` (string, optional): 'ASC' or 'DESC' (default: 'DESC')
- `type` (string, optional): Filter by application type
- `status` (string, optional): Filter by application status
- `priority` (string, optional): Filter by application priority
- `schoolId` (number, optional): Filter by school ID
- `assignedTo` (string, optional): Filter by assigned user
- `dateFrom` (string, optional): Filter from date (ISO format)
- `dateTo` (string, optional): Filter to date (ISO format)
- `isOverdue` (boolean, optional): Filter overdue applications

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "New Laptops Request",
      "type": "new_device_request",
      "status": "pending"
      // ... other application fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### GET /api/applications/school/:schoolId

Retrieve applications for a specific school with pagination.

**Query Parameters:**

- Same pagination parameters as above

### 2. Devices

#### GET /api/devices

Retrieve all devices with pagination.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Field to sort by (default: 'createdAt')
- `sortOrder` (string, optional): 'ASC' or 'DESC' (default: 'DESC')
- `schoolId` (number, optional): Filter by school ID

**Response:**

```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name_tag": "RTB-LAP-001",
        "category": "laptop"
        // ... other device fields
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 150,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 3. Schools

#### GET /api/schools

Retrieve all schools with pagination.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Field to sort by (default: 'createdAt')
- `sortOrder` (string, optional): 'ASC' or 'DESC' (default: 'DESC')

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ABC Primary School",
      "email": "abc@school.edu"
      // ... other school fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 4. Users

#### GET /api/users

Retrieve all users with pagination.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Field to sort by (default: 'createdAt')
- `sortOrder` (string, optional): 'ASC' or 'DESC' (default: 'DESC')

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
      // ... other user fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 30,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Usage Examples

### Frontend Implementation (JavaScript/TypeScript)

```typescript
// Basic pagination request
const fetchApplications = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/applications?page=${page}&limit=${limit}`);
  const result = await response.json();
  return result;
};

// With filtering and custom sorting
const fetchDevicesWithFilters = async (options = {}) => {
  const params = new URLSearchParams({
    page: options.page || 1,
    limit: options.limit || 10,
    sortBy: options.sortBy || "createdAt",
    sortOrder: options.sortOrder || "DESC",
    ...(options.schoolId && { schoolId: options.schoolId }),
  });

  const response = await fetch(`/api/devices?${params}`);
  const result = await response.json();
  return result.data; // PaginatedResponse<Device>
};

// Handle pagination in UI
const handlePageChange = (newPage) => {
  fetchApplications(newPage).then((result) => {
    setApplications(result.data);
    setPagination(result.pagination);
  });
};
```

### cURL Examples

```bash
# Basic pagination
curl "http://localhost:3000/api/applications?page=1&limit=10"

# With filtering and custom sorting
curl "http://localhost:3000/api/devices?page=2&limit=20&sortBy=name_tag&sortOrder=ASC&schoolId=5"

# Applications with filters
curl "http://localhost:3000/api/applications?page=1&limit=25&status=pending&priority=high&sortBy=createdAt&sortOrder=DESC"
```

## Implementation Details

### Validation

- Page numbers are automatically clamped to minimum 1
- Limit is clamped between 1 and MAX_PAGE_SIZE (100)
- Invalid sort fields fall back to 'createdAt'
- Invalid sort orders fall back to 'DESC'

### Performance Considerations

- Database queries use OFFSET/LIMIT for efficient pagination
- Total count is calculated separately to avoid performance issues
- Eager loading of related entities is optimized
- Indexes are recommended on commonly sorted fields

### Backward Compatibility

- All pagination parameters are optional
- APIs return the same data structure with additional pagination metadata
- Existing clients will continue to work with default pagination settings

## Error Handling

If invalid pagination parameters are provided, the API will:

1. Use validation to ensure safe defaults
2. Log warnings for debugging
3. Return a successful response with corrected parameters

Example error scenarios:

- `page=0` → defaults to `page=1`
- `limit=1000` → clamped to `limit=100`
- `sortBy=invalidField` → defaults to `sortBy=createdAt`

## Future Enhancements

1. **Cursor-based pagination** for real-time data streams
2. **Search integration** with pagination
3. **Caching** for frequently requested pages
4. **Bulk operations** with pagination support
5. **Analytics** tracking for pagination usage patterns
