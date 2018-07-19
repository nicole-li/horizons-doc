import React, { Component } from 'react';

import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';

import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton
} from 'draft-js-buttons';

import {EditorState, RichUtils} from 'draft-js';

import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import ScrollArea from 'react-scrollbar';

import io from 'socket.io-client'

class HeadlinesPicker extends Component {
  componentDidMount() {
    setTimeout(() => { window.addEventListener('click', this.onWindowClick); });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick = () =>
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    this.props.onOverrideContent(undefined);

  render() {
    const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];
    return (
      <div>
        {buttons.map((Button, i) => // eslint-disable-next-line
          <Button key={i} {...this.props} />
        )}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  onClick = () =>
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(HeadlinesPicker);

  render() {
    return (
      <div className='headlineButtonWrapper'>
        <button onClick={this.onClick} className='headlineButton'>
          F
        </button>
      </div>
    );
  }
}

const toolbarPlugin = createToolbarPlugin({
  structure: [
    BoldButton,
    ItalicButton,
    UnderlineButton,
    CodeButton,
    Separator,
    HeadlinesButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton
  ]
});
const { Toolbar } = toolbarPlugin;
const plugins = [toolbarPlugin];

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

export default class CustomToolbarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io('http://localhost:3000'),
      modalIsOpen: false,
      toUser: '',
      title: this.props.doc['title'],
      else: false
    };
    if (this.props.doc['content'].length === 0) {
      this.state.editorState = EditorState.createEmpty();
    }
    else {
      this.state.editorState = createEditorStateWithText(this.props.doc['content'])
    }
  }

  componentDidMount = () => {
    this.state.socket.on('connect', () => {
      console.log('frontend connected');
      // this.state.socket.emit('userJoined', this.props.user);

      this.state.socket.emit('watchDoc', this.props.doc["_id"], this.props.user);

      this.state.socket.on('update', (content) => {
        // console.log("LOOK AT ME", content);

        var newContent=  createEditorStateWithText(content);
        var selection= this.state.editorState.getSelection();
        //
        // console.log("NEW CONTENT", newContent);
        // console.log("SELECTION", this.state.editorState);
        //
        var newEditorState = EditorState.forceSelection(newContent, selection)

        // console.log("Over Here", newEditorState.getCurrentInlineStyle());
        // this.setState({editorState: newContent})

        this.setState({editorState: newContent, else: true})
        this.save(newContent.getCurrentContent().getPlainText());
      })

      this.state.socket.on('joinRoomError', (error) =>
        console.log('room full error', error)
      )
    })
  }

  componentWillUnmount =() => {
    this.state.socket.off('watchDoc', this.remoteStateChange);
    this.state.socket.emit('closeDocument', (this.props.doc._id, this.props.user));
  }

  remoteStateChange =(res) => {
    this.setState({
      editorState: EditorState.createWithContent(convertFromRaw(res.rawState))
     });
  }


  onChange = (editorState) => {

    if(this.state.else){
      this.setState({else: false});
    }else{
    // console.log("On Change", editorState);
    this.setState({editorState: editorState });
    this.state.socket.emit('sync', this.props.doc,
      editorState.getCurrentContent().getPlainText())
    }

      // console.log("After Emit", editorState);
    // console.log("eeeee", this.state.editorState.getCurrentContent().getPlainText());
    // this.setState({
    //   editorState: editorState,
    // });
    // this.state.socket.emit('sync', this.props.doc, this.state.editorState.getCurrentContent().getPlainText())
  };

  focus = () => {
    this.editor.focus();
  };

  save = (content) => {
    // console.log("In Save")
    fetch('http://localhost:3000/save/'+this.props.doc._id, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        content: content,
        lastEditTime: Date.now()
      })
    })
    .then((response) => response.json())
    .then((responseJson) => console.log(responseJson))
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  share = () => {
    fetch('http://localhost:3000/share', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        username: this.state.toUser,
        docId: this.props.doc._id
      })
    })
    .then((response) => response.json())
    .then((json) => console.log(json))
  }

  render() {
    return (
      <ScrollArea>
      <div>
        <h1>Document Editor</h1>
        <div className="nav">
          <button className="button" onClick={()=>{this.props.redirect('Home')}}>Home</button>
          <button className="button" type='submit'onClick={this.openModal}>Share</button>
        </div>
        <input className="title" onChange={(e) => this.setState({title: e.target.value})} value={this.state.title}/>

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h2 ref={subtitle => this.subtitle = subtitle}>Share</h2>
          <form>
            <input onChange={(e) => this.setState({toUser: e.target.value})} value={this.state.toUser}/>
            <button onClick={this.share}>Share</button>
            <button onClick={this.closeModal}>Cancel</button>
          </form>
        </Modal>

        <Toolbar />
        <div className='editor' onClick={this.focus}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
        </div>
      </div>
      </ScrollArea>
    );
  }
}
