import React from 'react';
import Login from './Login.jsx';
import Document from './Document.jsx';
import Register from './Register.jsx';
// import io from 'socket.io';

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
      docs: [],
      display: {
        content: 'Welcome! Start typing here'
      }
    };
    this.redirect = this.redirect.bind(this);
  }

  componentDidMount(){
    fetch('http://localhost:3000/retrieveAll')
    .then(resp => resp.json())
    .then(json => this.setState({
      docs: this.state.docs.concat(json)
    }))
  }

  redirect(page) {
    console.log(page)
    this.setState({currentPage: page})
  }

  displayDoc(doc) {
    this.setState({
      currentPage: 'Document',
      display: doc
    })
  }

  render(){
    return(
      <div>
        {
          this.state.currentPage === "Home" ?
          <div>
            <h1>Home Page</h1>
            <div className="nav">
              <button className="button" onClick={()=>{this.redirect('Login')}}>Logout</button>
              <button className="button" onClick={()=>{this.redirect('Document')}}>New Document</button>
            </div>
            <div className="docList">
              {this.state.docs.map((doc) => <DocItem onClick={()=>{this.displayDoc(doc)}} doc={doc}/>)}
            </div>
          </div>
          : null
        }
        {this.state.currentPage === "Login" ? <Login redirect={this.redirect}/> : null}
        {this.state.currentPage === "Document" ? <Document doc={this.state.display} redirect={this.redirect}/> : null}
        {this.state.currentPage === "Register" ? <Register redirect={this.redirect}/> : null}
      </div>
    )
  }
}
