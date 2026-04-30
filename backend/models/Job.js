const mongoose = require("mongoose")

const JobSchema = new mongoose.Schema({

title: String,

description: String,

skillsRequired: [String],

client: {
type: mongoose.Schema.Types.ObjectId,
ref: "User"
},

deadline: Date,

createdAt: {
type: Date,
default: Date.now
}

})

module.exports = mongoose.model("Job", JobSchema)