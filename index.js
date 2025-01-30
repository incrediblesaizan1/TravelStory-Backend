require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({ origin: "*" }));

app.get("/",(req, res)=>{
    res.send("hello ssss khan")
})

app.listen(process.env.PORT)