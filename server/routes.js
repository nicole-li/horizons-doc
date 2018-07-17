const express = require('express');

const router = express.Router();

const models = require('../src/models.js');

const User = models.User;
const Document = models.Document;

mongoose.connection.on('connected', function(){
  console.log("Successfully Connected");
})
mongoose.connect(process.env.MONGODB_URI);

router.post('/save/:id', (req, res) => {
  let id = req.params.id;
  Document.findByIdAndUpdate(id, { content: req.body.content,
    lastEditTime: req.body.lastEditTime }, function(err, result) {
      if (err) {
        console.log("Selected Doc cannot be saved because it does not exist");
      } else{
        console.log("Doc Successfully Saved");
      }
    })
})

router.post('/newDoc/:title', (req, res) => {
  new Document({
    content: [],
    owner: req.user._id,
    collaboratorList: [],
    title: req.params.title,
    createdTime: new Date(),
    lastEditTime: new Date()
  }).save();
});


router.post('/share/:id', (req, res) => {
  Document.findById(req.params.id, function (err, result) {
    if (err) {
      res.send('Could Not Share Document');
    } else {
      result.collaboratorList.push(req.user);
    }
  })

  new Document({
    content: [],
    owner: req.user._id,
    collaboratorList: [],
    title: req.params.title,
    createdTime: new Date(),
    lastEditTime: new Date()
  })
  .save();
})

// get a document from the home page
router.get('/retrieve', (req, res) => {
  let id = req.params.id;
  Document.findById(id, (error, resp) => {
    res.send(resp)
  })
})


module.exports = router;
