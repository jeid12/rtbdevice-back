# Device Management System

## Overview

The Device Management System is the core component of the RTB Device Management application. It handles the complete lifecycle of devices including creation, assignment to schools, tracking, and automatic name tag generation.

## Key Features

### 1. Automatic Name Tag Generation

The system automatically generates name tags for devices based on the following format:

- **RTB/{CategoryPrefix}/{DistrictPrefix}/{Number}**

#### Category Prefixes:

- **LT** - Laptop
- **DT** - Desktop
- **PT** - Projector
- **OT** - Other

#### District Prefix:

- First 3 letters of the district name (uppercase)
- Example: "Kigali" → "KIG"

#### Number:

- 3-digit sequential number starting from 001
- Automatically increments based on existing devices in the same school and category

#### Examples:

- `RTB/LT/KIG/001` - First laptop assigned to a school in Kigali district
- `RTB/DT/MUS/005` - Fifth desktop assigned to a school in Musanze district
- `RTB/LT/DEFAULT/001` - Laptop not assigned to any school

### 2. Device States

#### Unassigned Devices

- Default name tag: `RTB/{CategoryPrefix}/DEFAULT/001`
- Not associated with any school
- Can be bulk assigned later

#### Assigned Devices

- School-specific name tag with district prefix
- Automatically generated when assigned to school
- Name tag updates automatically if reassigned

### 3. CRUD Operations

#### Create Device

- **Endpoint**: `POST /api/devices`
- **Required Fields**: serialNumber, model, purchaseCost, category
- **Optional Fields**: schoolId, purchaseDate, specifications
- **Auto-generates**: name_tag based on school assignment

#### Read Devices

- **Get All**: `GET /api/devices` (with pagination)
- **Get by ID**: `GET /api/devices/:id`
- **Get by School**: `GET /api/devices/school/:schoolId`
- **Search**: `GET /api/devices/search?q=searchTerm`
- **Statistics**: `GET /api/devices/statistics`

#### Update Device

- **Endpoint**: `PUT /api/devices/:id`
- **Auto-updates**: name_tag if school or category changes
- **Supports**: All device fields

#### Delete Device

- **Endpoint**: `DELETE /api/devices/:id`
- **Access**: Admin only

### 4. School Assignment Operations

#### Assign Device to School

- **Endpoint**: `PUT /api/devices/:id/assign`
- **Body**: `{ "schoolId": number }`
- **Auto-generates**: New name tag based on school district

#### Unassign Device

- **Endpoint**: `PUT /api/devices/:id/unassign`
- **Reverts**: Name tag to default format

#### Bulk Assignment

- **Endpoint**: `PUT /api/devices/bulk/assign`
- **Body**: `{ "deviceIds": number[], "schoolId": number }`
- **Generates**: Name tags for all devices sequentially

### 5. Bulk Operations

#### Bulk Create

- **Endpoint**: `POST /api/devices/bulk/create`
- **Body**: `{ "devices": DeviceData[] }`
- **Generates**: Name tags for all devices

#### Excel Import

- **Endpoint**: `POST /api/devices/import`
- **File**: Excel file with device data
- **Template**: Available at `GET /api/devices/template`
- **Validation**: Comprehensive validation with error reporting

#### Excel Export

- **Endpoint**: `GET /api/devices/export`
- **Query**: `?schoolId=number` (optional)
- **Format**: Comprehensive Excel with all device data

#### Bulk Delete

- **Endpoint**: `DELETE /api/devices/delete`
- **Body**: `{ "deviceIds": number[] }`
- **Access**: Admin only

### 6. Device Tracking

#### Last Seen Update

- **Endpoint**: `PUT /api/devices/:id/last-seen`
- **Updates**: lastSeenAt timestamp
- **Usage**: For tracking when devices were last active

### 7. Advanced Features

#### Device Statistics

- Total devices count
- Count by category
- Assigned vs unassigned counts
- Average age calculation
- School-specific statistics

#### Search Functionality

- Search by name tag
- Search by serial number
- Search by model
- School-filtered search

#### Age Calculation

- Automatic age calculation based on purchase date
- Getter method `ageInYears` on Device entity

## Database Schema

### Device Entity Fields

- `id` - Primary key
- `name_tag` - Auto-generated unique identifier
- `serialNumber` - Unique device serial number
- `model` - Device model name
- `purchaseCost` - Purchase cost in RWF
- `category` - enum: 'laptop', 'desktop', 'projector', 'other'
- `lastSeenAt` - Last activity timestamp
- `purchaseDate` - Purchase date
- `specifications` - JSON object with storage, ram, processor
- `age` - Manual age field (optional)
- `school` - ManyToOne relationship with School
- `createdAt`, `updatedAt` - Timestamps

### Indexes

- Unique index on serialNumber
- Index on category
- Index on model
- Index on purchaseDate

## API Permissions

### Admin

- Full CRUD access
- Bulk operations
- School assignment/unassignment
- Import/Export
- Statistics

### School

- Read access to own devices
- Create devices (auto-assigned to their school)
- Update own devices
- Search within own devices
- Statistics for own devices

## Excel Import Template

### Required Columns

- `serialNumber` - Device serial number
- `model` - Device model
- `category` - laptop/desktop/projector/other
- `purchaseCost` - Cost in RWF

### Optional Columns

- `schoolId` - School assignment
- `purchaseDate` - YYYY-MM-DD format
- `storage` - Storage specification
- `ram` - RAM specification
- `processor` - Processor specification

## Name Tag Generation Algorithm

1. **Determine Category Prefix**

   - Map device category to 2-letter code

2. **Check School Assignment**

   - If no school: Use "DEFAULT"
   - If school assigned: Get first 3 letters of district

3. **Find Next Sequential Number**

   - Query existing devices for same school + category
   - Extract highest number from existing name tags
   - Increment by 1
   - Format as 3-digit number (001, 002, etc.)

4. **Generate Final Name Tag**
   - Combine: RTB + Category + District + Number

## Error Handling

- Comprehensive validation on all inputs
- Duplicate serial number prevention
- Invalid category validation
- School existence validation
- Excel import error reporting with row-level details
- Transaction rollback on bulk operation failures

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination for large device lists
- Efficient query building for search operations
- Bulk operations optimized for large datasets
- Memory-efficient Excel processing

This device management system provides a comprehensive solution for tracking and managing devices with automatic naming conventions, bulk operations, and detailed reporting capabilities.
