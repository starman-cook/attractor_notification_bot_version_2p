import mongoose from "mongoose";
const Schema = mongoose.Schema

const LessonSchema = new Schema({
    chatId: String,
    groupName: String,
    lessonDayOne: String,
    lessonDayTwo: String,
    webinarOne: String,
    webinarTwo: String,
    time: String,
    holidayOne: String, // DateTime
    holidayTwo: String, // DateTime
    lessonNumber: Number,
    examNumber: Number,
    dateOfLastLesson: String
})

export const Lesson = mongoose.model('lessons', LessonSchema)