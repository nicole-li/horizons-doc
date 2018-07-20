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
    if(this.state.username && this.state.password){
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
  }else{
    console.log("User must enter credentials to login")
  }
  }

  render(){
    return(
      <div className="pageContainer verticalAlign">
        <div>
          <h2 className="h2">Login</h2>
          <div className="form-signin">
            <input
              placeholder="Username"
              className="form-control"
              onChange={(e) => this.setState({username: e.target.value})}
              value={this.state.username}
              type="text"/>
            <input
              className="form-control"
              placeholder="Password"
              onChange={(e) => this.setState({password: e.target.value})}
              value={this.state.password}
              type="password"/>
            <button onClick={this.login} className="btn btn-lg btn-primary btn-block">Login</button>
          </div>
          <button className="btn btn-link" onClick={()=>{this.props.redirect('Register')}}>Register</button>
        </div>
      </div>
    )
  }
}
