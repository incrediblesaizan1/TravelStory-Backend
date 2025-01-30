require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/user.model");
const travelstoriesModel = require("./models/TravelStories.model");
const isLoggedIn = require("./middelware/isLoggedIn.middleware");
const fs = require("fs");
const path = require("path");


mongoose
  .connect(
    `mongodb+srv://incrediblesaizan22:U2ZhR6q4CZiHP736@travelstories.y2ynt.mongodb.net/?retryWrites=true&w=majority&appName=TravelStories`
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(() => {
    console.log("MongoDB connection error:", error);
  });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("hello user khan");
});


app.post("/signup", async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res
        .status(400)
        .json({ Error: true, message: "All fields are required" });
    }

    const isUser = await UserModel.findOne({ $or: [{ email }, { username }] });
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

    return res
      .cookie("accessToken", accessToken)
      .status(200)
      .json({
        Error: false,
        user: { fullname: newUser.fullname, email: newUser.email },
        message: "User Registered successfully",
      });
  } catch (error) {
    console.log("Something went wrong while registering user", error);
    res.status(500).json("Something went wrong while registering user");
  }
});


app.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res
        .status(400)
        .json({ Error: true, message: "All fields are required " });

    let user = await UserModel.findOne({
      $or: [{ email: req.body.identifier }, { username: req.body.identifier }],
    });
    if (!user)
      return res.status(400).json({ Error: true, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      "lslsdlsdlsfndnvlsklskdssldsldsl"
    );

    return res
      .cookie("accessToken", accessToken)
      .status(200)
      .json({
        Error: false,
        message: "You LoggedIn Successfully",
        user: { fullname: user.fullname, email: user.email },
      });
  } catch (error) {
    console.log("Something went wrong while login user", error);
    res.status(500).end("Something went wrong while login user");
  }
});


app.get("/user", isLoggedIn, async (req, res) => {
  const { userId } = req.user;

  const isUser = await UserModel.findOne({ _id: userId });
  if (!isUser) {
    return res.status(401);
  }

  return res.json({
    user: isUser,
    message: "",
  });
});


app.post("/travelStory", isLoggedIn, async (req, res) => {
  const { title, story, visitedLocation, isFavourite, imageUrl, visitedDate } =
    req.body;
  const { userId } = req.user;
  const user = await UserModel.findOne({ _id: userId });
  console.log(user);

  if (
    !title ||
    !story ||
    !visitedLocation ||
    !isFavourite ||
    !imageUrl ||
    !visitedDate
  ) {
    return res
      .status(400)
      .json({ Error: true, Message: "All fields are required" });
  }

  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = await travelstoriesModel.create({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    });
    user.post.push(travelStory._id);
    await user.save();
    await travelStory.save();
    res.status(201).json({ story: travelStory, message: "Added Successfully" });
  } catch (error) {
    res.status(400).json({ Error: true, message: error.message });
  }
});


app.listen(process.env.PORT || 3000);
