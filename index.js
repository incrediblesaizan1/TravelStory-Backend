require("dotenv").config()
const express = require("express")
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.get("/",(req, res)=>{
    res.send("hello saizan khan")
})

app.listen(process.env.PORT)