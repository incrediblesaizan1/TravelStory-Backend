require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
const UserModel = require("./models/user.model")
const travelStoryModel = require("./models/TravelStories.model")
const isLoggedIn = require("./middelware/isLoggedIn.middleware")
const fs = require("fs")
const path = require("path");


mongoose.connect(
    `mongodb+srv://incrediblesaizan22:U2ZhR6q4CZiHP736@travelstories.y2ynt.mongodb.net/?retryWrites=true&w=majority&appName=TravelStories`
  ).then(()=>{
    console.log("MongoDB connected successfully")
  }).catch(()=>{
    console.log("MongoDB connection error:", error);
  })


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({ origin: "*" }));


app.get("/",(req, res)=>{
    res.send("hello user khan")
})


app.post("/signup", async (req, res) => {
    try {
      const { fullname, username, email, password } = req.body;
  
      if (!fullname || !username || !email || !password) {
        return res
          .status(400)
          .json({ Error: true, message: "All fields are required" });
      }
  
      const isUser = await UserModel.findOne({$or: [{ email }, { username}],});
      if (isUser) {
        return res
          .status(400)
          .json({ Error: true, message: "User already registered" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await UserModel.create({ 
        fullname,
        email,
        username,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      const accessToken = jwt.sign(
        { userId: newUser._id },
       "lslsdlsdlsfndnvlsklskdssldsldsl"
      );
  
      return res.cookie("accessToken", accessToken).status(200).json({
        Error: false,
        user: { fullname: newUser.fullname, email: newUser.email },
        message: "User Registered successfully",
      })
    } catch (error) {
      console.log("Something went wrong while registering user", error);
      res.status(500).json("Something went wrong while registering user");
    }
  });



app.listen(process.env.PORT || 3000)