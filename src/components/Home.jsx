import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#App');

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      docs: [],
      modalIsOpen: false,
      title: ''
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
    fetch('http://localhost:3000/logout', {
      credentials: 'same-origin',
    })
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

  newDoc = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/newDoc/'+this.state.title, {
      method: 'POST',
      header: {
        "Content-Type": "application/json; charset=utf-8"
      },
      credentials: 'same-origin',
    })
    .then(resp => resp.json())
    .then(json => {
      if (json.success) {
        console.log('user: ', json.user);
        console.log('doc: ', json.document);
        this.props.display(json.document);
      }
      else {
        console.log('Could not create new document: ' + json.error);
      }
    })
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  // afterOpenModal = () => {
  //   // references are now sync'd and can be accessed.
  //   this.subtitle.style.color = '#f00';
  // }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  render(){
    return(
      <div className="pageContainer">
        <h1>Welcome Home, {this.props.user}</h1>

        <br/>

        <div className="nav">
          <button className="button" onClick={this.logout}>Logout</button>
          <button className="button" onClick={this.openModal}>New Document</button>
        </div>

        <br/>

        <Modal
          isOpen={this.state.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h3>Create New Document</h3>
          <div>
            <input onChange={(e) => this.setState({title: e.target.value})} value={this.state.title}/>
            <button onClick={this.newDoc}>Create</button>
            <button onClick={this.closeModal}>Cancel</button>
          </div>
        </Modal>

        <div className="docList">
          {this.state.docs.map((doc) => <p onClick={()=>{this.displayDoc(doc)}}>{doc.title}</p>)}
        </div>
      </div>
    )
  }
}
