import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      username: '',
      password: ''
    }
  }

  login = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/login', {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
    .then((resp) => resp.json())
    .then((json) => {
      if (json.success) {
        console.log('Successfully logged in.')
        this.props.setUser(this.state.username)
        this.props.redirect('Home')
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
          <p>Username: <input
            onChange={(e) => this.setState({username: e.target.value})}
            value={this.state.username}
            type="text"/></p>
          <p>Password: <input
            onChange={(e) => this.setState({password: e.target.value})}
            value={this.state.password}
            type="text"/></p>
          <button onClick={this.login} className="button">Login</button>
        </div>
        <button className="button" onClick={()=>{this.props.redirect('Register')}}>Register</button>
      </div>
    )
  }
}
