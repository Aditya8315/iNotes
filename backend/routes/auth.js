const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "Aditya priyanshu";

const { body, validationResult } = require('express-validator');

//Route 1 -------------------------------------------------------------------------------------------------------------
//cretaing a user using post "/api/auth/createuser" . No login required
router.post('/createuser', [
     body('name').isLength({ min: 5 }),
     body('email').isEmail(),
     body('password').isLength({ min: 5 })
], async (req, res) => {
     //to check the errors and return band requests
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
     }
     try {
          //check whether user with this email exists already
          let success=false;
          let user = await User.findOne({ email: req.body.email });
          if (user) {
               return res.status(400).json({ error: "Account with this email already exists !" })
          }
          const salt = await bcrypt.genSalt(10);
          const secpass = await bcrypt.hash(req.body.password, salt);
          user = await User.create({
               name: req.body.name,
               password: secpass,
               email: req.body.email,
          })
          const data = {
               user: {
                    id: user.id
               }
          }
          const authtoken = jwt.sign(data, JWT_SECRET);
          success=true;
          res.json({ success:success,authtoken:authtoken })
     } catch (error) {
          // console.log(error.message);
          res.status(500).send({success:success,error:"some error occured"});

     }
})//-------------------------------------------------------------------------------------------------------------------
//Route 2 -------------------------------------------------------------------------------------------------------------
//authenticate the user , No login required
router.post('/login', [
     body('email', "enter a valid email").isEmail(),
     body('password', "Pass can not be empty").exists()
], async (req, res) => {
     let success = false;
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
     }
     const { email, password } = req.body;
     try {
          let user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({ success:success,error: "Enter correct email" });
          }
          const passwordcompare = await bcrypt.compare(password, user.password);
          if (!passwordcompare) {
               return res.status(400).json({success:success, error: "Enter correct password" });
          }
          const data = {
               user: {
                    id: user.id
               }
          }
          const authtoken = jwt.sign(data, JWT_SECRET);
          success=true;
          res.json({success:success, authtoken:authtoken })

     } catch (error) {
          // console.log(error.message);
          res.status(500).send("some error occured");
     }
})
//----------------------------------------------------------------------------------------------------------------------
//Route 3 
//Get user details .Login required
router.post('/getuser', fetchuser, async (req, res) => {
     try {
          userId = req.user.Id;
          const user = await User.findById(userId).select("-password");
          res.send(user);

     } catch (error) {
          // console.log(error);
          res.status(501).send({ error: "Internal server error" });
     }
})
module.exports = router