const express = require('express')
const router = express.Router()
const User = require('../models/User')
const {body, validationResult} = require('express-validator')              
const bcrypt = require('bcryptjs');            //  'bcrypt' returns a promise...
const jwt = require('jsonwebtoken');          
const fetchuser = require("../middleware/fetchuser")

JWT_SECRET = "@RakeshRoy"


// Check usign 'thunderclient'
// ➡️ ROUTE 1 : Create a User using: POST "/api/auth/createuser". No login required...
router.post('/createuser',[          //  Add this array...       
    body('name', 'Enter a valid name').isLength({min: 3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({min: 5})

], async(req, res)=>{

    // console.log(req.body)
    // const user = User(req.body)
    // user.save()
    // res.send(req.body)

    // ➡️ If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    // ➡️ Check whether the user with this email exists already
    try {

        let userr = await User.findOne({email: req.body.email})
        if(userr){
            return res.status(400).json({error: "Sorry a use with this email already exists"})
        }


        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)         // ➡️ 'bcrypt' returns a promise...
        // ➡️ Create a new user
        userr = await User.create({
            name: req.body.name,
            email: req.body.email,
            // password: req.body.password            
            password: secPass             
        })
        // .then(user => res.json(user))
        // .catch(err => {console.log(err)
        // res.json({error: "Please enter a unique value for email", message: err.message})})
        // res.json(userr)


        const jwtData = jwt.sign({id: userr._id}, JWT_SECRET)
        // console.log(jwtData)
        res.json({authToken: jwtData})
    }
    catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }
})

// ➡️ ROUTE 2 : Authenticate a User using: POST "/api/auth/login". No login required...
router.post('/login', [          //  Add this array...       
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password cannnot be blank').exists(),
    ],  async (req, res)=> {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password} = req.body;
    try{
        let user = await User.findOne({email: email})
        if(!user){
            return res.status(400).json({error: "Please try to login with correct credentials"})
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({error: "Please try to login with correct credentials"})
        }

        const payload_data = {
            user:{
                id: user._id
            }
        }
        const authToken = jwt.sign(payload_data, JWT_SECRET)
        res.send({authToken: authToken})

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }
})


// ➡️ ROUTE 3 : Get loggedin User Details using: POST "/api/auth/getuser". login required...
router.post('/getuser', fetchuser, async (req, res)=> {
    
    try {
        let userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }

})


module.exports = router