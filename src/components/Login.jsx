import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
  }

  render(){
    return(
      <div>
        <h2 className="page1">Login</h2>
        <form className="form">
          <p>Username: <input type="text"/></p>
          <p>Password: <input type="text"/></p>
          <button className="button">Login</button>
        </form>
        <button className="button" onClick={()=>{this.props.redirect('Home')}}>Home</button>
        <button className="button" onClick={()=>{this.props.redirect('Register')}}>Register</button>
      </div>
    )
  }
}
