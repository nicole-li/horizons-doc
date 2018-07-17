import React from 'react';
import Login from './Login.jsx';
import Document from './Document.jsx';
import Register from './Register.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {currentPage: "Login"};
    this.redirect = this.redirect.bind(this);
  }

  redirect(page) {
    this.setState({currentPage: page})
  }

  render(){
    return(
      <div>
        {
          this.state.currentPage === "Home" ?
          <div>
            <h1>Home Page</h1>
            <button className="button" onClick={()=>{this.redirect('Login')}}>Logout</button>
            <button className="button" onClick={()=>{this.redirect('Document')}}>New Document</button>
          </div>
          : null
        }
        {this.state.currentPage === "Login" ? <Login redirect={this.redirect}/> : null}
        {this.state.currentPage === "Document" ? <Document redirect={this.redirect}/> : null}
        {this.state.currentPage === "Register" ? <Register redirect={this.redirect}/> : null}
      </div>
    )
  }
}
