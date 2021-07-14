import mongoose from "mongoose";
import moment from "moment";
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
    dateOfLastLesson: {
        type: String,
        default: moment().format("DD-MM-YYYY")
    },
    groupAdmin: {
        type: String,
        default: "Чубакабра"
    }
})

export const Lesson = mongoose.model('lessons', LessonSchema)