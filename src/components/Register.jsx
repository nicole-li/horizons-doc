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
      <div className="pageContainer">
        <h2 className="h2">Register</h2>
        <div className="form-signin">
          <input
            placeholder="Enter Username"
            className="form-control"
            onChange={(e)=> this.setState({username: e.target.value})}
            value={this.state.username}
            name="username"
            type="text"/>
          <input
            className="form-control"
            placeholder="Enter Password"
            onChange={(e)=> this.setState({password: e.target.value})}
            value={this.state.password}
            name="password2"
            type="password"/>
          <input
            className="form-control"
            placeholder="Repeat Password"
            onChange={(e)=> this.setState({passwordRepeat: e.target.value})}
            value={this.state.passwordRepeat}
            name="passwordRepeat"
            type="password"/>
          <button onClick={this.register} className="btn btn-lg btn-primary btn-block">Register</button>
        </div>
        <button className="btn btn-link" onClick={()=>{this.props.redirect('Login')}}>Login</button>
      </div>
    )
  }
}
