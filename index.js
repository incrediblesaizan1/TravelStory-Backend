require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")



mongoose.connect(
    `mongodb+srv://incrediblesaizan22:${process.env.MONGODB_KEY}@travelstories.y2ynt.mongodb.net/?retryWrites=true&w=majority&appName=TravelStories`
  ).then(()=>{
    console.log("MongoDB connected successfully")
  }).catch(()=>{
    console.log("MongoDB connection error:", error);
  })

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({ origin: "*" }));





app.get("/",(req, res)=>{
    res.send("hello kkk khan")
})

app.listen(process.env.PORT)