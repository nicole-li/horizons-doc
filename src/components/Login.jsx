import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
  }


  login = (e) => {
    e.preventDefault;
    fetch('http://localhost:3000/login', {
      method: 'POST',
      data: {
      }
    })
    .then((resp) => resp.json())
    .then((json) => {
      if (json.success) {
        this.props.redirect('Document')
      }
      else {
        alert('Could not Login.')
      }
    })
  }

  render(){
    return(
      <div>
        <h2 className="h2">Login</h2>
        <div className="form">
          <p>Username: <input type="text"/></p>
          <p>Password: <input type="text" /></p>
          <button className="button" onClick={this.login}>Login</button>
        </div>
        <button className="button" onClick={()=>{this.props.redirect('Home')}}>Home</button>
        <button className="button" onClick={()=>{this.props.redirect('Register')}}>Register</button>
      </div>
    )
  }
}
