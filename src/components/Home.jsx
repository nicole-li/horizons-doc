import React from 'react';

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      docs: []
    }
  }

  componentDidMount(){
    fetch('http://localhost:3000/retrieveAll', {
      credentials: 'same-origin',
    })
    .then(resp => resp.json())
    .then(json => {
      if (json.success) {
        console.log('Successfully retrieved documents.')
        this.setState({docs: json.result["docList"]})
      }
      else {
        console.log('Could not retrieve documents: ' + json.error)
      }
    })
  }

  displayDoc(doc) {
    this.props.display(doc);
  }

  logout = () => {
    fetch('http://localhost:3000/logout')
    .then(resp => resp.json())
    .then(json => {
      if (json.success) {
        console.log('Successfully logged out.')
        this.props.redirect('Login')
      }
      else {
        alert('Could not Logout')
      }
    })
  }

  newDoc = () => {
    fetch('http://localhost:3000/newDoc/Untitled', {
      method: 'POST',
      header: {
        "Content-Type": "application/json; charset=utf-8"
      }
    })
    .then(resp => resp.json())
    .then(json => {
      if (json.success) {
        console.log(json.user);
        console.log(json.document);
        this.props.redirect('Document');
      }
      else {
        console.log('Could not create new document: ' + json.error);
      }
    })
  }

  render(){
    return(
      <div>
        <h1>Home Page</h1>
        <div className="nav">
          <button className="button" onClick={this.logout}>Logout</button>
          <button className="button" onClick={this.newDoc}>New Document</button>
        </div>
        <div className="docList">
          {this.state.docs.map((doc) => <p onClick={()=>{this.displayDoc(doc)}}>{doc.title}</p>)}
        </div>
      </div>
    )
  }
}
