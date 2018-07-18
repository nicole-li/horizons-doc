import React from 'react';

export default class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      username: '',
      password: '',
      passwordRepeat: ''
    }
  }

  register = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        passwordRepeat: this.state.passwordRepeat
      })
    })
    .then(resp => resp.json())
    .then((json) => {
      console.log(json);
      if (json.success) {
        console.log(json.user);
        this.props.redirect('Login')
      }
      else {
        alert('Could not Register.')
      }
    })
  }

  render(){
    return(
      <div>
        <h2 className="page1">Register</h2>
        <div className="form">
          <p>Username: <input
            onChange={(e)=> this.setState({username: e.target.value})}
            value={this.state.username} name="username" type="text"/></p>
          <p>Password: <input
            onChange={(e)=> this.setState({password: e.target.value})}
            value={this.state.password} name="password"type="text"/></p>
          <p>*Password: <input
            onChange={(e)=> this.setState({passwordRepeat: e.target.value})}
            value={this.state.passwordRepeat}
            name="passwordRepeat" type="text"/></p>
          <button onClick={this.register} className="button">Register</button>
        </div>
        <button className="button" onClick={()=>{this.props.redirect('Login')}}>Login</button>
      </div>
    )
  }
}
