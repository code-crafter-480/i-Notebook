const express = require('express')
const router = express.Router()
const Note = require('../models/Notes')
const fetchuser = require("../middleware/fetchuser")
const {body, validationResult} = require('express-validator')              



// 👉 ADD ➡️ ROUTE 1 : Get All the Notes using: GET "/api/auth/getuser". login required...
router.get('/fetchallnotes', fetchuser, async(req, res)=>{       // ata oi particular user er notes fetch kore debe jeta logged in a6e...
    try {
        const notes = await Notes.find({user: req.user.id})
        res.json(notes)   
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }
})

// 👉 ADD ➡️ ROUTE 2 : add a new Note using: POST "/api/auth/addnote". login required...
router.get('/addnote', fetchuser, [          //  Add this array...       
    body('title', 'Enter a valid title').isLength({min: 3}),
    body('description', 'Description must be atleast 5 characters').isLength({min: 5})

],async(req, res)=>{   

    const { title, description, tag } = req.body

    // ➡️ If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const note = new Note({
            title: title,
            description: description,
            tag: tag,
            user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }
})

module.exports = router