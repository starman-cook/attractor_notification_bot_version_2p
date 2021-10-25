"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMessage = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var AdminMessageSchema = new Schema({
    message: String,
    weeksAndTime: [Object]
});
exports.AdminMessage = mongoose_1.default.model('adminMessages', AdminMessageSchema);
//# sourceMappingURL=admin_message_model.js.map