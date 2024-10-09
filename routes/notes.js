const express = require('express')
const router = express.Router()
const Note = require('../models/Notes')
const fetchuser = require("../middleware/fetchuser")
const {body, validationResult} = require('express-validator')              



// 👉 ADD ➡️ ROUTE 1 : Get All the Notes using: GET "/api/notes/getuser". login required...
router.get('/fetchallnotes', fetchuser, async(req, res)=>{       // ata oi particular user er notes fetch kore debe jeta logged in a6e...
    try {
        const note = await Note.find({user: req.user.id})
        res.json(note)   
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }
})

// 👉 ADD ➡️ ROUTE 2 : add a new Note using: POST "/api/notes/addnote". login required...
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


// 👉 ADD ➡️ ROUTE 3 : Update an existing Note using: PUT "/api/notes/updatenote/:id". login required...
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        // Create a newnote object
        const newNote = {}
        if( title ){ newNote.title = title }
        if( description ) { newNote.description = description }
        if( tag ) { newNote.tag = tag }
    
        // Find the note to be updated and update it
        let note = await Note.findById( req.params.id )
        if(!note) { return res.status(404).send("Not found.")}
    
        // Allow updation only if user owns this Note...
        if ( note.user.toString() !== req.user.id ) {             // 'toString' a user er id dekhabe...
            return res.status(401).send("Not Allowed.")
        }
    
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({note})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }

})


// 👉 ADD ➡️ ROUTE 4 : Delete an existing Note using: DELETE "/api/notes/deletenote/:id". login required...
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    
    try {
        // Find the note to be delete and deleted it
        let note = await Note.findById( req.params.id )
        if(!note) { return res.status(404).send("Not found.")}
    
        // Allow deletion only if user owns this Note...
        if ( note.user.toString() !== req.user.id ) {             // 'toString' a user er id dekhabe...
            return res.status(401).send("Not Allowed.")
        }
    
        note = await Note.findByIdAndDelete( req.params.id )
        res.json( { "Success": "Note has been delete", note:note } )
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error")
    }

})



module.exports = router