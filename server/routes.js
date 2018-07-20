const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
var models = require('./models.js');

var User = models.User;
var Document= models.Document;

mongoose.connection.on('connected', function(){
  console.log("Successfully Connected");
})
mongoose.connect(process.env.MONGODB_URI);

router.post('/save/:id', (req, res) => {
  let id = req.params.id;
  Document.findByIdAndUpdate(id, { content: req.body.content,
    lastEditTime: req.body.lastEditTime}, function(err, result) {
      if (err) {
        res.json({success:false})
        console.log("Selected Doc cannot be saved because it does not exist");
      }else{
        console.log('save history test' , result);
        var historyArr = result.history.slice();
        historyArr.push(result.content)
        console.log(historyArr);
        Document.findByIdAndUpdate(id, { history: historyArr}, function(error, docResult) {
          if(error) {
            res.json({success: false, error: error})
          } else {
            res.json({success: true})
          }
        })
      }
    })
  })

  router.post('/newDoc/:title', (req,res)=> {
    // req.user = {
    //       "docList": [],
    //       "_id": "5b4e71af6892915dbf0121b5",
    //       "username": "nicole",
    //       "password": "nicole",
    //       "__v": 0
    //   }
    new Document({
      content: '',
      owner: req.user._id,
      collaboratorList: [],
      title: req.params.title, createdTime: new Date(),
      lastEditTime: new Date()
    }).save(function(error, docResult) {
      if (error) {
        res.json({
          success: false,
          error: error
        })
      } else {
        User.findById(req.user._id, function(error, userResult) {
          if(error) {
            res.json({success: false})
          } else {
            userResult.docList.push(docResult._id);
            userResult.save(function(error, result) {
              if (error) {
                res.json({
                  success: false
                })
              } else {
                res.json({
                  success: true,
                  user: userResult,
                  document: docResult
                })
              }
            })
          }
        })
      }
    });
  })


  router.post('/share', (req,res) => {
    User.findOne({username: req.body.username}, function(err, userResult){
      if(err){
        res.json({
          success: false,
          error:err
        })
      }else{
        Document.findById(req.body.docId, function(err, docResult){
          if(err){
            res.json({
              success: false,
              error: err
            })
          }else{
            userResult.docList.push(req.body.docId);
            userResult.save(function(err, usersaveResult){
              if(err){
                res.json({
                  success: false,
                  error: err
                })
              }else{
                docResult.collaboratorList.push(userResult._id);
                docResult.save(function(err, result){
                  if(err){
                    res.json({
                      success: false,
                      error: err
                    })
                  }else{
                    res.json({
                      success: true,
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  })

  router.get('/retrieveAll', (req, res) => {
    console.log('Retrieve all', req.user)
    User.findById(req.user._id)
    .populate("docList")
    .exec(function(err, result) {
      if(err){
        res.json({
          success: false,
          error: err
        })
      }else{
        res.json({
          success: true,
          result: result
        })
      }
    })
  })

  // Get a document from the home page
  router.get('/retrieve/:id', (req, res) => {
    var id = req.params.id;
    Document.findById(id).populate("collaboratorList").exec(function(err, result){
      if(err){
        res.json({
          success: false,
          error: err
        })
      }else{
        res.json({
          success: true,
          document: result
        })

      }
    })
  })

router.get('/collaborator/:id', (req, res) => {
  var id = req.params.id;
  User.findById(id).exec(function(err, result){
    if(err){
      res.json({
        success: false,
        error: err
      })
    }else{
      res.json({
        success: true,
        user: result
      })

    }
  })
})

  module.exports = router;
