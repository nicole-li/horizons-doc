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
      title: '',
      search: ''
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
        // console.log('user: ', json.user);
        // console.log('doc: ', json.document);
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

  search = (e) => {
    this.setState({
      search: e.target.value
    })
  }

  render(){
    return(
      <div className="pageContainer">
        <h1>{this.props.user}</h1>

        <br/>

        <div className="nav">
          <button className="btn btn-light" onClick={this.logout}>Logout</button>
          <button className="btn btn-light" onClick={this.openModal}>New Document</button>
          <input style={{textAlign: 'center'}} onChange={this.search} type="text" placeholder="Search"/>
        </div>

        <br/>

        <Modal
          isOpen={this.state.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h3 style={{textAlign: 'center'}}>Create New Document</h3>
          <div className="nav">
            <input style={{height: 'auto'}} onChange={(e) => this.setState({title: e.target.value})} value={this.state.title}/>
            <button className="btn btn-light" onClick={this.newDoc}>Create</button>
            <button className="btn btn-light" onClick={this.closeModal}>Cancel</button>
          </div>
        </Modal>

        <div className="docList">
          {this.state.docs
            .filter((doc) => doc.content.indexOf(this.state.search) > -1 || doc.title.indexOf(this.state.search) > -1)
            .map((doc) => <div className="form-signin form-control" key={doc._id} onClick={()=>{this.displayDoc(doc)}}>
              <h6>{doc.title}</h6>
              <p><span style={{fontWeight: 'bold'}}>Last Edited: </span>{new Date(doc.lastEditTime).toLocaleString()}</p>
            </div>)}
        </div>
      </div>
    )
  }
}
