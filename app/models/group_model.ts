import mongoose from "mongoose";
const Schema = mongoose.Schema

const GroupSchema = new Schema({
    chatId: String,
    groupName: String,

    currentWeek: Number,

    lessons: [Object],
    webinars:  [Object],

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
})

export const Group = mongoose.model('groups', GroupSchema)