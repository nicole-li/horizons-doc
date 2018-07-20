import React from 'react';
import Login from './Login.jsx';
import Document from './Document.jsx';
import Register from './Register.jsx';
import Home from './Home.jsx';


class DocItem extends React.Component {
  render() {
    return(
      <div onClick={this.props.onClick} className="docItem">
        <h2>{this.props.doc.title}</h2>
      </div>
    )
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPage: "Login",
      display: {},
      username: '',
    };
    this.redirect = this.redirect.bind(this);
    this.display = this.display.bind(this);
    this.setUser = this.setUser.bind(this);
  }

  redirect(page) {
    console.log(page)
    this.setState({currentPage: page})
  }

  display(doc) {
    // console.log(doc)
    this.setState({
      display: doc,
      currentPage: 'Document'
    })
    // console.log(this.state.display)
  }

  setUser(username) {
    this.setState({username: username})
  }

  render(){
    return(
      <div>
        {this.state.currentPage === "Home" ? <Home user={this.state.username} redirect={this.redirect} display={this.display}/> : null}
        {this.state.currentPage === "Login" ? <Login redirect={this.redirect} setUser={this.setUser}/> : null}
        {this.state.currentPage === "Document" ? <Document user={this.state.username} doc={this.state.display} redirect={this.redirect}/> : null}
        {this.state.currentPage === "Register" ? <Register redirect={this.redirect}/> : null}
      </div>
    )
  }
}
