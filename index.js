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
const fileUpload = require("express-fileupload")
const uploadToCloudinary = require("./cloudinary")

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

  const allowedOrigins = [
    "http://localhost:5173",
    "https://incrediblesaizan1-travel-stories.vercel.app",
  ];

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);
app.use(cookieParser())
app.options("*", cors())


app.get("/", (req, res) => {
  res.json({message: "Hello Saizan khan, how are you" });
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
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,   // Use `false` for localhost, `true` for production
      sameSite: "none" 
    })
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
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,   // Use `false` for localhost, `true` for production
      sameSite: "none" 
    })
    .status(200)
    .json({
      Error: false,
      message: "You Logged In Successfully",
      user: { fullname: user.fullname, email: user.email },
    });
  } catch (error) {
    console.log("Something went wrong while login user", error);
    res.status(500).end("Something went wrong while login user");
  }
});

app.get("/logout",isLoggedIn, async(req,res)=>{
  res.cookie("accessToken", " ",{
    httpOnly: true,
    secure: true,   // Use `false` for localhost, `true` for production
    sameSite: "none" 
  })
  res.json({message: "you logged out successfully."})
})

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
  const { title, story, visitedLocation, imageUrl, visitedDate } =
    req.body;
  const { userId } = req.user;
  const user = await UserModel.findOne({ _id: userId });

  if (
    !title ||
    !story ||
    !visitedLocation ||
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


app.put("/edit-travelStory/:id", isLoggedIn, async(req, res)=>{

  const {id} = req.params;
  const {title, story, visitedLocation, imageUrl, visitedDate} = req.body;
  const {userId} = req.user

  if(!title || !story || !visitedLocation  || !imageUrl || !visitedDate){
    return res.status(400).json({Error: true, Message: "All fields are required"})
  }

  const parsedVisitedDate = new Date(parseInt(visitedDate));

 try {
  const travelStory = await travelstoriesModel.findOne({_id: id, userId: userId})

  if(!travelStory){
    return res.status(404).json({Error: true, message: "Travel story not found"})
  }

  const placeHolderImgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS7c-zKeZDyCPmpNh8li9OMWH4KIBlagiu5w&s"

  travelStory.title = title;
  travelStory.story = story;
  travelStory.visitedLocation = visitedLocation;
  travelStory.imageUrl = imageUrl ||  placeHolderImgUrl;
  travelStory.visitedDate = parsedVisitedDate

  await travelStory.save()
  res.status(200).json({story: travelStory, message :"update successfully"})

 } catch (error) {
  res.status(500).json({Error: true, message: error.message})
 }

 })


 app.delete("/delete-travelStory/:id", isLoggedIn, async(req, res)=>{
 const {id} = req.params;
 const {userId} = req.user;


try {
   const travelStory = await travelstoriesModel.findOne({_id: id, userId: userId})

   if(!travelStory){
     return res.status(404).json({Error: true, message: "Travel story not found"})
   }

   await travelStory.deleteOne({_id: id, userId: userId})

   const imageUrl = travelStory.imageUrl;
   const filename = path.basename(imageUrl)

   const filepath = path.join(__dirname, "uploads", filename)
   fs.unlink(filepath, (err)=>{
    if(err){
      console.error("Failed to delete image file:", err)
    }
   })
   res.status(200).json({message: "Travel story deleted successfully"})

} catch (error) {
  res.status(400).json({ Error: true, message: error.message });
}

 })


app.get("/get-all-travelStories", async(req,res)=>{

     try {
      const travelStories = await travelstoriesModel.find()
      res.status(200).json({stories: travelStories})
     } catch (error) {
      res.status(500).json({Error: true,message: error.message})
     }

})  


app.get("/get-user-travelStories", isLoggedIn, async(req,res)=>{
    const {userId} = req.user;

     try {
      const travelStories = await travelstoriesModel.find({userId: userId}).sort({isFavourite: 1})
      res.status(200).json({stories: travelStories})
     } catch (error) {
      res.status(500).json({Error: true,message: error.message})
     }

})


app.post("/image-upload", async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({ Error: true, message: "No Image Uploaded" });
    }

    const imageFile = req.files.image;

    const result = await uploadToCloudinary(imageFile.data);
    res.status(200).json({ imageUrl: result.url });
  } catch (error) {
    console.error('Upload Error:', error); // Improved logging
    res.status(500).json({ Error: true, message: error.message || 'Unknown error occurred' });
  }
});


app.delete("/image-delete", isLoggedIn, async(req, res)=>{
  const {imageUrl} = req.query;

  if(!imageUrl){
    return res.status(400).json({Error: true, message: "Image Url in parameters is required"})
  }

  try {
    const fileName = path.basename(imageUrl)

    const filePath = path.join(__dirname, "uploads", fileName)

    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)
      res.status(200).json({message: "Image Deleted Successfully"})
    }else{
      res.status(200).json({Error: true, message: "Image not found"})
    }

  } catch (error) {
    res.status(500).json({error: true, message: error.message})
  }

})


app.put("/update-is-favourite/:id", isLoggedIn, async(req, res)=>{
  const {id} = req.params
  const {isFavourite} = req.body
  const {userId} = req.user

  try {
    const travelStory = await travelstoriesModel.findOne({_id: id, userId: userId})
    if(!travelStory){
      return res.status(404).json({Error: true, message: "Travel story not found"})
    }

    travelStory.isFavourite = isFavourite
    await travelStory.save()
    res.status(200).json({story: travelStory, message:"Update successful"})

  } catch (error) {
    res.status(500).json({error: true, message: error.message})
  }

})


app.get("/search", isLoggedIn, async(req, res)=>{
  const {query} = req.query
  const {userId} = req.user;


  if(!query){
    return res.status(404).json({Error: true, message: "query is required"})
  }


  try {
    const searchResults = await travelstoriesModel.find({
      userId: userId,
      $or: [
        {title: {$regex: query, $options:"i"}},
        {story: {$regex: query, $options:"i"}},
        {visitedLocation: {$regex: query, $options:"i"}}
      ],
    }).sort({isFavourite: -1})

    res.status(200).json({stories: searchResults})
  } catch (error) {
    res.status(500).json({error: true, message: error.message})
  }

})


app.get("/travel-stories-filter", isLoggedIn, async(req, res)=>{

  const {startDate, endDate } = req.query;
  const {userId} = req.user;

  try {

    const start = new Date(parseInt(startDate)) 
    const end = new Date(parseInt(endDate))

    const filterStories = await travelstoriesModel.find({
      userId: userId,
      visitedDate:{$gte: start, $lte: end},
    }).sort({isFavourite: -1})

    res.status(200).json({stories: filterStories})
  } catch (error) {
    res.status(500).json({error: true, message: error.message})
  }

})

app.listen(process.env.PORT || 3000);