import mongoose from "mongoose";
const Schema = mongoose.Schema

const AdminMessageSchema = new Schema({
    message: String,
    weeksAndTime: [Object]
})

export const AdminMessage = mongoose.model('adminMessages', AdminMessageSchema)