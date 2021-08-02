"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var GroupSchema = new Schema({
    chatId: String,
    groupName: String,
    currentWeek: Number,
    lessons: [Object],
    webinars: [Object],
    holidays: [String],
    holidayWeeksNumbers: [Number],
    groupAdmin: {
        type: String,
        default: "Чубакабра"
    },
    isActive: {
        type: Boolean,
        default: true
    }
});
exports.Group = mongoose_1.default.model('groups', GroupSchema);
//# sourceMappingURL=group_model.js.map