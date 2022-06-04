const express = require('express');
const router = express.Router(); 
var fetchuser=require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route 1 ----- get all the notes 
router.get('/fetchnotes',fetchuser,async (req,res)=>{
   try{  const notes = await Notes.find({user:req.user.id});
     res.json(notes);
}
catch(error){
          console.log(error.message);
          res.status(500).send("Internal server error occured");
     }
})

//Route 2 ----- add a new note using post .login required
router.post('/addnotes',fetchuser,[
     body('title','Enter a title').exists(),
     body('description')
],async (req,res)=>{
     try {
          const{title,description,tag}=req.body;
          //to check the errors and return band requests
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }
          const note= new Notes({
          title,description,tag,user:req.user.id
          })
          const savednote = await note.save(); 
          res.json(note);   
     }
     catch (error) {
          console.log(error.message);
          res.status(500).send("Internal server error occured");
     }
})
//Route 3 ----- update the notes using POST ./api/auth/notes/updatenotes, login required 
router.put('/updatenotes/:id',fetchuser,async (req,res)=>{
     try{  const{title,description,tag}=req.body;
     //create a empty note object 
     const newnote={};
     //check what things are coming ...put only that in newnote
     if(title){newnote.title=title};
     if(description){newnote.description=description};
     if(tag){newnote.tag=tag};

     //find that the note is of curent user or not..
     let note= await Notes.findById(req.params.id);
     if(!note){
          return res.status(404).send("Note not found");
     }
     //if current user is not real owner of the note
     if(note.user.toString()!= req.user.id){
          return res.status(401).send("Unauthorised access is not allowed");
     }
     //now update the note
     note = await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true});
     res.json(note);
  }
  catch(error){
            console.log(error.message);
            res.status(500).send("Internal server error occured");
       }
  })

//Route 4 ----- Delete the notes using DELETE ./api/auth/notes/deletenotes, login required 
router.delete('/deletenotes/:id',fetchuser,async (req,res)=>{
     try{  
          const{title,description,tag}=req.body;

     //find that the note is of curent user or not..
     let note= await Notes.findById(req.params.id);
     if(!note){
          return res.status(404).send("Note not found");
     }
     //if current user is not real owner of the note
     if(note.user.toString()!= req.user.id){
          return res.status(401).send("Unauthorised access is not allowed");
     }
     note = await Notes.findByIdAndDelete(req.params.id);
     res.json({"Success":"Note deleted !"});
     
  }
  catch(error){
            console.log(error.message);
            res.status(500).send("Internal server error occured");
       }
  })

module.exports = router