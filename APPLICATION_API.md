# Application Management API Documentation

## Overview

The Application Management system supports two types of applications:

1. **New Device Request** - Schools can request new devices with PDF application letters
2. **Maintenance Request** - Schools can report device issues requiring maintenance

## Authentication

All endpoints require authentication via JWT tokens. Use the `Authorization: Bearer <token>` header.

## Base URL

All application endpoints are under `/api/applications`

## Endpoints

### 1. Create New Device Request

**POST** `/api/applications/new-device`

**Authorization:** School or Admin

**Content-Type:** `multipart/form-data` (for PDF upload)

**Request Body:**

```javascript
{
  "title": "Request for 50 Laptops - Kigali Primary School",
  "description": "We need new laptops for our computer lab to support 200 students",
  "schoolId": 1,
  "requestedDeviceCount": 50,
  "requestedDeviceType": "laptop",
  "justification": "Our current devices are over 8 years old and no longer functional",
  "priority": "medium" // Optional: low, medium, high, urgent
}
```

**Files:**

- `applicationLetter`: PDF file (max 5MB, optional)

**Response:**

```javascript
{
  "id": 1,
  "type": "new_device_request",
  "title": "Request for 50 Laptops - Kigali Primary School",
  "status": "pending",
  "school": { ... },
  "requestedDeviceCount": 50,
  "applicationLetterPath": "/uploads/applications/application-123456.pdf",
  // ... other fields
}
```

### 2. Create Maintenance Request

**POST** `/api/applications/maintenance`

**Authorization:** School or Admin

**Request Body:**

```javascript
{
  "title": "Laptop Screen Issues - Computer Lab",
  "description": "Multiple laptops in the computer lab have screen problems",
  "schoolId": 1,
  "priority": "high",
  "deviceIssues": [
    {
      "deviceId": 15,
      "problemDescription": "Screen flickering constantly"
    },
    {
      "deviceId": 23,
      "problemDescription": "Black screen, no display"
    }
  ]
}
```

**Response:**

```javascript
{
  "id": 2,
  "type": "maintenance_request",
  "title": "Laptop Screen Issues - Computer Lab",
  "status": "pending",
  "school": { ... },
  "deviceIssues": [
    {
      "id": 1,
      "device": { ... },
      "problemDescription": "Screen flickering constantly",
      "actionTaken": null,
      "resolvedAt": null
    }
  ],
  // ... other fields
}
```

### 3. Get All Applications (Admin Only)

**GET** `/api/applications`

**Authorization:** Admin

**Query Parameters:**

- `type`: Filter by application type (`new_device_request` | `maintenance_request`)
- `status`: Filter by status (`pending` | `under_review` | `approved` | `rejected` | `in_progress` | `completed` | `cancelled`)
- `priority`: Filter by priority (`low` | `medium` | `high` | `urgent`)
- `schoolId`: Filter by school ID
- `assignedTo`: Filter by assigned technician
- `dateFrom`: Filter from date (ISO string)
- `dateTo`: Filter to date (ISO string)
- `isOverdue`: Filter overdue applications (`true` | `false`)

**Example:** `/api/applications?status=pending&type=maintenance_request`

### 4. Get Applications by School

**GET** `/api/applications/school/:schoolId`

**Authorization:** School or Admin

### 5. Get Application by ID

**GET** `/api/applications/:id`

**Authorization:** School or Admin

### 6. Update Application (Admin Only)

**PUT** `/api/applications/:id`

**Authorization:** Admin

**Request Body:**

```javascript
{
  "status": "approved",
  "estimatedCost": 50000,
  "estimatedCompletionDate": "2025-07-15T00:00:00.000Z",
  "adminNotes": "Approved for procurement in Q3 2025"
}
```

### 7. Assign Application (Admin Only)

**POST** `/api/applications/:id/assign`

**Authorization:** Admin

**Request Body:**

```javascript
{
  "assignedTo": "john.doe@rtb.gov.rw"
}
```

### 8. Approve Application (Admin Only)

**POST** `/api/applications/:id/approve`

**Authorization:** Admin

**Request Body:**

```javascript
{
  "estimatedCost": 50000, // Optional
  "estimatedCompletionDate": "2025-07-15T00:00:00.000Z" // Optional
}
```

### 9. Reject Application (Admin Only)

**POST** `/api/applications/:id/reject`

**Authorization:** Admin

**Request Body:**

```javascript
{
  "rejectionReason": "Insufficient budget allocation for current fiscal year"
}
```

### 10. Complete Application (Admin Only)

**POST** `/api/applications/:id/complete`

**Authorization:** Admin

**Request Body:**

```javascript
{
  "actualCost": 48500 // Optional
}
```

### 11. Update Device Issue (Admin/Technician)

**PUT** `/api/applications/device-issue/:issueId`

**Authorization:** Admin or Technician

**Request Body:**

```javascript
{
  "actionTaken": "Replaced LCD screen and tested functionality",
  "resolved": true
}
```

### 12. Delete Application (Admin Only)

**DELETE** `/api/applications/:id`

**Authorization:** Admin

### 13. Get Application Statistics (Admin Only)

**GET** `/api/applications/stats/overview`

**Authorization:** Admin

**Response:**

```javascript
{
  "total": 150,
  "pending": 25,
  "approved": 45,
  "completed": 60,
  "rejected": 10,
  "newDeviceRequests": 80,
  "maintenanceRequests": 70,
  "overdue": 5
}
```

### 14. Download Application Letter

**GET** `/api/applications/:id/download-letter`

**Authorization:** School or Admin

Downloads the PDF application letter if available.

## Application Status Flow

1. **pending** → Application submitted by school
2. **under_review** → Admin is reviewing the application
3. **approved** → Application approved by admin
4. **in_progress** → Work has started (for maintenance) or procurement initiated (for new devices)
5. **completed** → Application fulfilled
6. **rejected** → Application rejected with reason
7. **cancelled** → Application cancelled

## Email Notifications

The system automatically sends email notifications for:

- New application submissions (to admins)
- Application status changes (to schools)
- Maintenance request assignments (to technicians)

## File Upload

- Only PDF files are allowed for application letters
- Maximum file size: 5MB
- Files are stored in `/uploads/applications/` directory
- File naming: `application-{timestamp}-{random}.pdf`

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:

```javascript
{
  "error": "Missing required fields: title, description, schoolId"
}
```
