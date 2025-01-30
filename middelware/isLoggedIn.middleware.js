const jwt = require("jsonwebtoken")

function isLoggedIn(req, res, next){
   try {
     if(!req.cookies.accessToken) return res.status(400).json({message: "You must be loggedIn "})
     let data = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET)
    if(data){
     req.user = data
    }
    next()
   } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ message: "Invalid or expired token" });
   }
}

module.exports = isLoggedIn