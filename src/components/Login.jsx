import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      username: '',
      password: ''
    }
  }

  login = () => {
    fetch('/login', {
      method: 'POST',
      data: {
        username: this.state.username,
        password: this.state.password
      }
    })
    .then(resp => resp.json())
    .then(json => {
      if (json.success) {
        this.props.redirect('Home')
      }
    })
  }

  render(){
    return(
      <div>
        <h2 className="h2">Login</h2>
        <div className="form">
          <p>Username: <input onChange={(e) => this.setState({username: e.target.value})} type="text"/></p>
          <p>Password: <input onChange={(e) => this.setState({password: e.target.value})} type="text"/></p>
          <button onClick={this.login} className="button">Login</button>
        </div>
        <button className="button" onClick={()=>{this.props.redirect('Home')}}>Home</button>
        <button className="button" onClick={()=>{this.props.redirect('Register')}}>Register</button>
      </div>
    )
  }
}
