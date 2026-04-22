const express = require("express")
const Job = require("../models/Job")
const auth = require("../middleware/authMiddleware")

const router = express.Router()

// create job
router.post("/", auth, async(req,res)=>{

const job = new Job({

title:req.body.title,
description:req.body.description,
skillsRequired:req.body.skills,
client:req.user.id

})

await job.save()

res.json(job)

})

// get all jobs
router.get("/", async(req,res)=>{

const jobs = await Job.find().populate("client","name")

res.json(jobs)

})

module.exports = router;

const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

exports.verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};
module.exports = router;