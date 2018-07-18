import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      username: '',
      password: '',
      passwordRepeat: ''
    }
  }

  register = (e) => {
    e.preventDefault;
    fetch('http://localhost:3000/register', {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        passwordRepeat: this.state.passwordRepeat
      })
    })
    .then((resp) => resp.json())
    .then((json) => {
      if (json.success) {
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
          <p>Username: <input onChange={(e)=> this.setState({username: e.target.value})} name="username" type="text"/></p>
          <p>Password: <input onChange={(e)=> this.setState({password: e.target.value})}  name="password"type="text"/></p>
          <p>*Password: <input onChange={(e)=> this.setState({passwordRepeat: e.target.value})} name="passwordRepeat" type="text"/></p>
          <button onClick={this.register} className="button">Register</button>
        </div>
        <button className="button" onClick={()=>{this.props.redirect('Login')}}>Login</button>
      </div>
    )
  }
}
