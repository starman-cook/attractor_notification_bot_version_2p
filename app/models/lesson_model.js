"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var LessonSchema = new Schema({
    chatId: String,
    groupName: String,
    lessonDayOne: String,
    lessonDayTwo: String,
    webinarOne: String,
    webinarTwo: String,
    time: String,
    holidayOne: String,
    holidayTwo: String,
    lessonNumber: Number,
    examNumber: Number,
    dateOfLastLesson: String
});
exports.Lesson = mongoose_1.default.model('lessons', LessonSchema);
