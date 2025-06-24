# RTB Device Management System - API Documentation

## Overview

The RTB Device Management System is a comprehensive platform for managing devices, schools, and users in the Rwanda TVET Board ecosystem. It provides advanced features including automated device assignment, maintenance scheduling, analytics, and real-time monitoring.

## Features

### Core Features

- **Device Management**: Full CRUD operations for devices with automatic name tag generation
- **School Management**: Complete school administration with geographic and facility information
- **User Management**: Role-based user system with school assignments
- **Bulk Operations**: Excel import/export for devices and schools

### Advanced Features

- **Advanced Search**: Powerful search with filters, sorting, and autocomplete
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Automation System**: Automated maintenance reminders, warranty tracking, and device optimization
- **Real-time Monitoring**: Device online/offline status tracking
- **Email Notifications**: Automated email alerts for maintenance, warranties, and system events

## API Endpoints

### Authentication

All endpoints require JWT authentication except for login/register.

### Base URL

```
http://localhost:8080/api
```

## Device Management

### Basic Device Operations

#### Get All Devices

```http
GET /devices
```

**Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `schoolId` (optional): Filter by school ID

#### Get Device by ID

```http
GET /devices/:id
```

#### Create Device

```http
POST /devices
```

**Body:**

```json
{
  "serialNumber": "SN123456",
  "model": "HP EliteBook 840",
  "brand": "HP",
  "purchaseCost": 850000,
  "category": "laptop",
  "status": "active",
  "condition": "good",
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2027-01-15",
  "specifications": {
    "storage": "512GB SSD",
    "ram": "16GB",
    "processor": "Intel i7-11th Gen",
    "graphics": "Integrated",
    "screenSize": "14 inch",
    "operatingSystem": "Windows 11"
  }
}
```

#### Update Device

```http
PUT /devices/:id
```

#### Delete Device

```http
DELETE /devices/:id
```

#### Assign Device to School

```http
POST /devices/:id/assign
```

**Body:**

```json
{
  "schoolId": 1,
  "assignedToUser": "John Doe",
  "assignedToUserContact": "john@school.edu.rw"
}
```

### Bulk Device Operations

#### Import Devices from Excel

```http
POST /devices/bulk/import
```

**Content-Type:** `multipart/form-data`
**Body:** Excel file with device data

#### Export Devices to Excel

```http
GET /devices/bulk/export
```

**Parameters:**

- `schoolId` (optional): Filter by school
- `category` (optional): Filter by category

#### Download Import Template

```http
GET /devices/bulk/template
```

#### Bulk Delete Devices

```http
DELETE /devices/bulk
```

**Body:**

```json
{
  "deviceIds": [1, 2, 3, 4, 5]
}
```

## School Management

#### Get All Schools

```http
GET /schools
```

#### Get School by ID

```http
GET /schools/:id
```

#### Create School

```http
POST /schools
```

**Body:**

```json
{
  "name": "Kigali Technical School",
  "code": "KTS001",
  "province": "Kigali",
  "district": "Gasabo",
  "sector": "Kimisagara",
  "cell": "Nyabugogo",
  "village": "Nyabugogo I",
  "type": "tvet",
  "status": "active",
  "email": "info@kts.edu.rw",
  "phone": "+250788123456",
  "studentCount": 1500,
  "teacherCount": 80,
  "establishedDate": "2010-01-01",
  "coordinates": {
    "latitude": -1.944444,
    "longitude": 30.061111
  },
  "facilities": {
    "hasElectricity": true,
    "hasInternet": true,
    "hasLibrary": true,
    "hasLaboratory": true,
    "computerLabCount": 3
  }
}
```

#### Update School

```http
PUT /schools/:id
```

#### Delete School

```http
DELETE /schools/:id
```

## User Management

#### Get All Users

```http
GET /users
```

#### Get User by ID

```http
GET /users/:id
```

#### Create User

```http
POST /users
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@rtb.gov.rw",
  "password": "SecurePassword123!",
  "phone": "+250788123456",
  "gender": "Male",
  "role": "school",
  "status": "active",
  "schoolId": 1,
  "nationalId": "1199012345678901",
  "dateOfBirth": "1990-01-01",
  "address": "Kigali, Rwanda"
}
```

#### Update User

```http
PUT /users/:id
```

#### Delete User

```http
DELETE /users/:id
```

## Advanced Search

#### Search Devices

```http
GET /search/devices
```

**Parameters:**

- `query`: Text search across name, model, brand
- `category`: Filter by device category
- `status`: Filter by device status
- `condition`: Filter by device condition
- `schoolId`: Filter by school
- `province`: Filter by province
- `district`: Filter by district
- `dateFrom`: Filter by purchase date from
- `dateTo`: Filter by purchase date to
- `priceMin`: Minimum purchase cost
- `priceMax`: Maximum purchase cost
- `ageMin`: Minimum age in years
- `ageMax`: Maximum age in years
- `isOnline`: Filter by online status
- `needsMaintenance`: Filter devices needing maintenance
- `hasWarranty`: Filter devices with active warranty
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort field
- `sortOrder`: ASC or DESC

#### Search Schools

```http
GET /search/schools
```

**Parameters:**

- `query`: Text search across name, code
- `type`: Filter by school type
- `status`: Filter by school status
- `province`: Filter by province
- `district`: Filter by district
- `hasDevices`: Filter schools with/without devices
- `deviceCountMin`: Minimum device count
- `deviceCountMax`: Maximum device count
- `hasElectricity`: Filter by electricity availability
- `hasInternet`: Filter by internet availability

#### Search Users

```http
GET /search/users
```

**Parameters:**

- `query`: Text search across name, email
- `role`: Filter by user role
- `status`: Filter by user status
- `schoolId`: Filter by school assignment
- `isActive`: Filter by active status
- `hasSchool`: Filter users with/without school assignment

#### Global Search

```http
GET /search/global?query=HP&limit=10
```

#### Quick Search (for dashboard)

```http
GET /search/quick?query=laptop&limit=5
```

#### Autocomplete Suggestions

```http
GET /search/autocomplete?query=HP&type=device&limit=10
```

#### Get Search Filter Options

```http
GET /search/filters
```

## Analytics

#### Dashboard Statistics

```http
GET /analytics/dashboard
```

#### Device Analytics

```http
GET /analytics/devices
```

#### School Analytics

```http
GET /analytics/schools
```

#### User Analytics

```http
GET /analytics/users
```

#### Trend Analytics

```http
GET /analytics/trends?months=12
```

#### Generate Analytics Report

```http
POST /analytics/reports
```

**Body:**

```json
{
  "type": "comprehensive",
  "format": "json",
  "includeCharts": false,
  "filters": {}
}
```

#### Device Performance Metrics

```http
GET /analytics/devices/:deviceId/performance
```

#### School Performance Metrics

```http
GET /analytics/schools/:schoolId/performance
```

#### Cost Analysis

```http
GET /analytics/costs?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

#### Maintenance Analytics

```http
GET /analytics/maintenance?schoolId=1&deviceCategory=laptop
```

#### Utilization Analytics

```http
GET /analytics/utilization?province=Kigali&period=month
```

## Automation

#### Get Automation Rules

```http
GET /automation/rules
```

#### Create Automation Rule

```http
POST /automation/rules
```

**Body:**

```json
{
  "name": "Weekly Maintenance Check",
  "description": "Check for devices needing maintenance every week",
  "enabled": true,
  "triggerType": "schedule",
  "trigger": {
    "cron": "0 9 * * MON"
  },
  "actions": [
    {
      "type": "email",
      "parameters": {
        "template": "maintenance-reminder",
        "recipients": ["admin@rtb.gov.rw"]
      }
    }
  ]
}
```

#### Update Automation Rule

```http
PUT /automation/rules/:id
```

#### Delete Automation Rule

```http
DELETE /automation/rules/:id
```

#### Toggle Automation Rule

```http
PATCH /automation/rules/:id/toggle
```

#### Execute Automation Rule

```http
POST /automation/rules/:id/execute
```

### Maintenance Management

#### Get Maintenance Schedule

```http
GET /automation/maintenance/schedule?startDate=2024-01-01&endDate=2024-12-31
```

#### Schedule Maintenance

```http
POST /automation/maintenance/schedule
```

**Body:**

```json
{
  "deviceId": 1,
  "scheduledDate": "2024-02-15T09:00:00Z",
  "type": "preventive",
  "description": "Quarterly maintenance check",
  "priority": "medium",
  "estimatedCost": 50000,
  "assignedTechnician": "John Technician"
}
```

#### Update Maintenance Schedule

```http
PUT /automation/maintenance/schedule/:deviceId
```

### Monitoring and Alerts

#### Check Devices Needing Maintenance

```http
GET /automation/maintenance/needed
```

#### Check Warranty Expiries

```http
GET /automation/warranty/expiring?daysAhead=30
```

#### Detect Offline Devices

```http
GET /automation/devices/offline?hoursOffline=24
```

### Optimization

#### Optimize Device Assignments

```http
POST /automation/optimize/devices?dryRun=true
```

#### Auto-assign Users to Schools

```http
POST /automation/optimize/users?dryRun=false
```

#### Update Device Aging

```http
POST /automation/devices/aging/update
```

### Reporting

#### Get Automation Report

```http
GET /automation/reports?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Automation Statistics

```http
GET /automation/statistics
```

#### Run All Automations

```http
POST /automation/run-all
```

## Response Examples

### Successful Response

```json
{
  "id": 1,
  "name_tag": "KTS-LAP-001",
  "serialNumber": "SN123456",
  "model": "HP EliteBook 840",
  "brand": "HP",
  "purchaseCost": 850000,
  "category": "laptop",
  "status": "active",
  "condition": "good",
  "school": {
    "id": 1,
    "name": "Kigali Technical School",
    "code": "KTS001"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "error": "Device not found",
  "message": "The requested device could not be found",
  "statusCode": 404
}
```

### Paginated Response

```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## Role-Based Access Control

### Admin

- Full access to all endpoints
- Can manage all entities and configurations

### RTB Staff

- Full access to devices, schools, and users
- Can view analytics and run automations
- Cannot modify critical system settings

### School User

- Can view and manage devices assigned to their school
- Can view their school information
- Limited analytics access for their school only

### Technician

- Can view all devices and schools
- Can manage maintenance schedules
- Can access device performance metrics
- Limited user management access

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=rtb_device_management

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Server
PORT=8080
NODE_ENV=development
```

## Installation and Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd RTBdevice-back
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**

```bash
# Create PostgreSQL database
# Update database configuration in data-source.ts
```

5. **Run the application**

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Key Features Summary

1. **Comprehensive Device Management**: Track devices with detailed specifications, maintenance history, and real-time status
2. **Intelligent Search**: Advanced filtering and search capabilities across all entities
3. **Automated Operations**: Smart automation for maintenance, assignments, and alerts
4. **Rich Analytics**: Deep insights into device utilization, costs, and performance
5. **Role-Based Security**: Granular access control based on user roles
6. **Bulk Operations**: Efficient Excel-based import/export for large datasets
7. **Real-time Monitoring**: Live tracking of device status and usage
8. **Email Notifications**: Automated alerts for critical events and maintenance
9. **Performance Optimization**: AI-driven recommendations for device assignments
10. **Comprehensive Reporting**: Detailed reports and analytics for decision-making

This system provides a complete solution for managing IT assets in educational institutions, with modern features for automation, analytics, and optimization.
