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
exports.Device = exports.DeviceCondition = exports.DeviceStatus = exports.DeviceCategory = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const School_1 = require("./School");
var DeviceCategory;
(function (DeviceCategory) {
    DeviceCategory["LAPTOP"] = "laptop";
    DeviceCategory["DESKTOP"] = "desktop";
    DeviceCategory["PROJECTOR"] = "projector";
    DeviceCategory["OTHER"] = "other";
})(DeviceCategory || (exports.DeviceCategory = DeviceCategory = {}));
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["ACTIVE"] = "active";
    DeviceStatus["INACTIVE"] = "inactive";
    DeviceStatus["MAINTENANCE"] = "maintenance";
    DeviceStatus["DAMAGED"] = "damaged";
    DeviceStatus["LOST"] = "lost";
    DeviceStatus["DISPOSED"] = "disposed";
})(DeviceStatus || (exports.DeviceStatus = DeviceStatus = {}));
var DeviceCondition;
(function (DeviceCondition) {
    DeviceCondition["EXCELLENT"] = "excellent";
    DeviceCondition["GOOD"] = "good";
    DeviceCondition["FAIR"] = "fair";
    DeviceCondition["POOR"] = "poor";
    DeviceCondition["BROKEN"] = "broken";
})(DeviceCondition || (exports.DeviceCondition = DeviceCondition = {}));
let Device = class Device {
    // Computed properties
    get ageInYears() {
        if (!this.purchaseDate)
            return null;
        const now = new Date();
        const purchase = new Date(this.purchaseDate);
        let age = now.getFullYear() - purchase.getFullYear();
        const m = now.getMonth() - purchase.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < purchase.getDate())) {
            age--;
        }
        return age;
    }
    get isWarrantyActive() {
        if (!this.warrantyExpiry)
            return false;
        return new Date() < new Date(this.warrantyExpiry);
    }
    get daysSinceLastSeen() {
        if (!this.lastSeenAt)
            return null;
        const now = new Date();
        const lastSeen = new Date(this.lastSeenAt);
        const diffTime = Math.abs(now.getTime() - lastSeen.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get isOnline() {
        if (!this.lastSeenAt)
            return false;
        const now = new Date();
        const lastSeen = new Date(this.lastSeenAt);
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
        return diffMinutes <= 30; // Consider online if seen within 30 minutes
    }
    get needsMaintenance() {
        if (!this.nextMaintenanceDate)
            return false;
        const now = new Date();
        const nextMaintenance = new Date(this.nextMaintenanceDate);
        return now >= nextMaintenance;
    }
    get maintenanceOverdue() {
        if (!this.nextMaintenanceDate)
            return false;
        const now = new Date();
        const nextMaintenance = new Date(this.nextMaintenanceDate);
        const daysPast = (now.getTime() - nextMaintenance.getTime()) / (1000 * 60 * 60 * 24);
        return daysPast > 0;
    }
    get statusDisplay() {
        const statusMap = {
            [DeviceStatus.ACTIVE]: 'Active',
            [DeviceStatus.INACTIVE]: 'Inactive',
            [DeviceStatus.MAINTENANCE]: 'Under Maintenance',
            [DeviceStatus.DAMAGED]: 'Damaged',
            [DeviceStatus.LOST]: 'Lost',
            [DeviceStatus.DISPOSED]: 'Disposed',
        };
        return statusMap[this.status];
    }
    get conditionDisplay() {
        const conditionMap = {
            [DeviceCondition.EXCELLENT]: 'Excellent',
            [DeviceCondition.GOOD]: 'Good',
            [DeviceCondition.FAIR]: 'Fair',
            [DeviceCondition.POOR]: 'Poor',
            [DeviceCondition.BROKEN]: 'Broken',
        };
        return conditionMap[this.condition];
    }
    get categoryDisplay() {
        const categoryMap = {
            [DeviceCategory.LAPTOP]: 'Laptop',
            [DeviceCategory.DESKTOP]: 'Desktop',
            [DeviceCategory.PROJECTOR]: 'Projector',
            [DeviceCategory.OTHER]: 'Other',
        };
        return categoryMap[this.category];
    }
    get depreciationValue() {
        const age = this.ageInYears;
        if (!age || age <= 0)
            return this.purchaseCost;
        // Simple depreciation: 20% per year for first 3 years, then 10% per year
        let depreciationRate = 0;
        if (age <= 3) {
            depreciationRate = age * 0.2;
        }
        else {
            depreciationRate = 0.6 + ((age - 3) * 0.1);
        }
        const currentValue = this.purchaseCost * (1 - Math.min(depreciationRate, 0.9));
        return Math.max(currentValue, this.purchaseCost * 0.1); // Minimum 10% of original value
    }
    get totalMaintenanceCost() {
        if (!this.maintenance?.repairs)
            return 0;
        return this.maintenance.repairs.reduce((sum, repair) => sum + repair.cost, 0);
    }
};
exports.Device = Device;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Device.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Device.prototype, "name_tag", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Device.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Device.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Device.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Device.prototype, "purchaseCost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeviceCategory,
        default: DeviceCategory.OTHER,
    }),
    __metadata("design:type", String)
], Device.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeviceStatus,
        default: DeviceStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Device.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeviceCondition,
        default: DeviceCondition.GOOD,
    }),
    __metadata("design:type", String)
], Device.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Device.prototype, "lastSeenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Device.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Device.prototype, "nextMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Device.prototype, "warrantyExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Device.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Device.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Device.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Device.prototype, "assignedToUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Device.prototype, "assignedToUserContact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => School_1.School, (school) => school.devices, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", School_1.School)
], Device.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Device.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Device.prototype, "specifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Device.prototype, "software", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Device.prototype, "maintenance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Device.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Device.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Device.prototype, "updatedAt", void 0);
exports.Device = Device = __decorate([
    (0, typeorm_1.Index)('IDX_DEVICE_SERIAL', ['serialNumber'], { unique: true }),
    (0, typeorm_1.Index)('IDX_DEVICE_NAME_TAG', ['name_tag'], { unique: true }),
    (0, typeorm_1.Index)('IDX_DEVICE_CATEGORY', ['category']),
    (0, typeorm_1.Index)('IDX_DEVICE_MODEL', ['model']),
    (0, typeorm_1.Index)('IDX_DEVICE_PURCHASE_DATE', ['purchaseDate']),
    (0, typeorm_1.Index)('IDX_DEVICE_STATUS', ['status']),
    (0, typeorm_1.Index)('IDX_DEVICE_CONDITION', ['condition']),
    (0, typeorm_1.Index)('IDX_DEVICE_LAST_SEEN', ['lastSeenAt']),
    (0, typeorm_1.Index)('IDX_DEVICE_SEARCH', ['name_tag', 'serialNumber', 'model']),
    (0, typeorm_1.Entity)()
], Device);
