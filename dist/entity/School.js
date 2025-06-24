"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.School = exports.SchoolStatus = exports.SchoolType = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Device_1 = require("./Device");
var SchoolType;
(function (SchoolType) {
    SchoolType["PRIMARY"] = "primary";
    SchoolType["SECONDARY"] = "secondary";
    SchoolType["TVET"] = "tvet";
    SchoolType["UNIVERSITY"] = "university";
    SchoolType["OTHER"] = "other";
})(SchoolType || (exports.SchoolType = SchoolType = {}));
var SchoolStatus;
(function (SchoolStatus) {
    SchoolStatus["ACTIVE"] = "active";
    SchoolStatus["INACTIVE"] = "inactive";
    SchoolStatus["SUSPENDED"] = "suspended";
    SchoolStatus["PENDING"] = "pending";
})(SchoolStatus || (exports.SchoolStatus = SchoolStatus = {}));
let School = class School {
    // Computed properties
    get fullAddress() {
        const parts = [this.village, this.cell, this.sector, this.district, this.province]
            .filter(Boolean);
        return parts.join(', ');
    }
    get deviceCount() {
        return this.devices?.length || 0;
    }
    get activeDeviceCount() {
        if (!this.devices)
            return 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.devices.filter(device => device.lastSeenAt && device.lastSeenAt > thirtyDaysAgo).length;
    }
    get devicesByCategory() {
        if (!this.devices)
            return {};
        return this.devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + 1;
            return acc;
        }, {});
    }
    get averageDeviceAge() {
        if (!this.devices || this.devices.length === 0)
            return null;
        const devicesWithAge = this.devices.filter(d => d.ageInYears !== null);
        if (devicesWithAge.length === 0)
            return null;
        const totalAge = devicesWithAge.reduce((sum, d) => sum + (d.ageInYears || 0), 0);
        return Math.round((totalAge / devicesWithAge.length) * 100) / 100;
    }
    get totalDeviceValue() {
        if (!this.devices)
            return 0;
        return this.devices.reduce((sum, device) => sum + device.purchaseCost, 0);
    }
    get isActive() {
        return this.status === SchoolStatus.ACTIVE;
    }
    get schoolTypeDisplay() {
        const typeMap = {
            [SchoolType.PRIMARY]: 'Primary School',
            [SchoolType.SECONDARY]: 'Secondary School',
            [SchoolType.TVET]: 'TVET Institution',
            [SchoolType.UNIVERSITY]: 'University',
            [SchoolType.OTHER]: 'Other',
        };
        return typeMap[this.type];
    }
    get districtCode() {
        return this.district.substring(0, 3).toUpperCase();
    }
};
exports.School = School;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], School.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], School.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], School.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], School.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], School.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], School.prototype, "sector", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "cell", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "village", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SchoolType,
        default: SchoolType.PRIMARY,
    }),
    __metadata("design:type", String)
], School.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SchoolStatus,
        default: SchoolStatus.PENDING,
    }),
    __metadata("design:type", String)
], School.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], School.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], School.prototype, "studentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], School.prototype, "teacherCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], School.prototype, "establishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], School.prototype, "coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], School.prototype, "facilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], School.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], School.prototype, "lastInspectionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], School.prototype, "inspectionNotes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], School.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Device_1.Device, (device) => device.school),
    __metadata("design:type", Array)
], School.prototype, "devices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, (user) => user.school),
    __metadata("design:type", Array)
], School.prototype, "schoolUsers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], School.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], School.prototype, "updatedAt", void 0);
exports.School = School = __decorate([
    (0, typeorm_1.Index)('IDX_SCHOOL_NAME', ['name']),
    (0, typeorm_1.Index)('IDX_SCHOOL_CODE', ['code'], { unique: true }),
    (0, typeorm_1.Index)('IDX_SCHOOL_PROVINCE', ['province']),
    (0, typeorm_1.Index)('IDX_SCHOOL_DISTRICT', ['district']),
    (0, typeorm_1.Index)('IDX_SCHOOL_SECTOR', ['sector']),
    (0, typeorm_1.Index)('IDX_SCHOOL_TYPE', ['type']),
    (0, typeorm_1.Index)('IDX_SCHOOL_STATUS', ['status']),
    (0, typeorm_1.Index)('IDX_SCHOOL_SEARCH', ['name', 'code', 'district']),
    (0, typeorm_1.Entity)()
], School);
