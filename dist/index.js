"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const schoolRoutes_1 = __importDefault(require("./routes/schoolRoutes"));
const schoolBulkRoutes_1 = __importDefault(require("./routes/schoolBulkRoutes"));
const deviceRoutes_1 = __importDefault(require("./routes/deviceRoutes"));
const deviceBulkRoutes_1 = __importDefault(require("./routes/deviceBulkRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const automationRoutes_1 = __importDefault(require("./routes/automationRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Core routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/schools', schoolRoutes_1.default);
app.use('/api/schools', schoolBulkRoutes_1.default);
app.use('/api/devices', deviceRoutes_1.default);
app.use('/api/devices', deviceBulkRoutes_1.default);
// Advanced feature routes
app.use('/api/search', searchRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/automation', automationRoutes_1.default);
const PORT = process.env.PORT || 8080;
data_source_1.AppDataSource.initialize()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Available endpoints:');
        console.log('- Device Management: /api/devices');
        console.log('- School Management: /api/schools');
        console.log('- User Management: /api/users');
        console.log('- Advanced Search: /api/search');
        console.log('- Analytics: /api/analytics');
        console.log('- Automation: /api/automation');
    });
})
    .catch((error) => console.error(error));
