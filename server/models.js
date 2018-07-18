var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

if(!process.env.MONGODB_URI) throw new Error('uri missing');

mongoose.connect(process.env.MONGODB_URI)

var userSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  color:{
    type: String
  }
  docList: [{
    type: ObjectId,
    ref:'Document'
  }]
});

var documentSchema = new Schema({
  content: {
    type: Array,
    default: []
  },
  owner: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  collaboratorList: [{
    type: ObjectId,
    ref: 'User'
  }],
  title:{
    type: String,
    default: 'Untitled'
  },
  // password: {
  //   type: String
  // },
  createdTime: {
    type: Date
  },
  lastEditTime: {
    type: Date
  },
  numUser:{
    type: array,
    default=["red", "blue", "green", "orange", "yellow", "purple"];
  }
},
  {
    minimize: false
  })

var User = mongoose.model('User', userSchema);
var Document = mongoose.model('Document', documentSchema)
module.exports = {
  Document : Document,
  User : User
};
