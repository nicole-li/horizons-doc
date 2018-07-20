import React, { Component } from 'react';

//import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';

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

import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, SelectionState, ContentState, Modifier} from 'draft-js';

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
    console.log('@@ constructor', props)
    this.socket = io('http://localhost:3000'),
    this.state = {
      modalIsOpen: false,
      toUser: '',
      title: this.props.doc['title'],
      else: false,
      selectionState: '',
      editorState: EditorState.createEmpty(),
      doc: props.doc,
      colorAssigned: ''
    };
  }

  componentDidMount = () => {
    console.log('@@ componentDidMount')

    fetch('http://localhost:3000/retrieve/'+ this.props.doc._id,
    {credentials: 'same-origin'})
    .then((res)=>res.json())
    .then((res) => {
      if (res.success) {
        if (res.document.content.length === 0) {
          this.setState({ editorState : EditorState.createEmpty()})
        }
        else {

          this.setState({ editorState : EditorState.createWithContent(convertFromRaw(JSON.parse(res.document.content)))})
        }
      }else{
        console.log("FETCH FAILED", res)
      }
        console.log('frontend connected');


      this.socket.emit('watchDoc', {id: res.document._id, username: this.props.user}, ()=>{
            this.socket.on('joinRoomError', (error) => console.log('room full error', error))
        this.socket.on('update', ({content, username}) => {
          console.log("@@update", content, username, this.props.user)

          var newContent  = EditorState.createWithContent(convertFromRaw(content));
          var selection= this.state.editorState.getSelection();

          var newEditorState = EditorState.forceSelection(newContent, selection)

          //this.save((convertToRaw(newEditorState.getCurrentContent())));
          this.setState({editorState: newEditorState})
        })
      });
      var colorAssigned = ''
      this.socket.on('color', (color) => {
        console.log('in 156 color')
        this.setState({colorAssigned: color})
      })
      // var selection = this.state.editorState.getSelection();

      var unsavedEditorState = this.state.editorState;

      this.socket.on('otherUserSelection', ({selectionState, color}) => {
        var selection = SelectionState.createEmpty();
        selectionState = selection.merge(selectionState);
        console.log('in 161 otherUserSelection', selectionState)
        this.setState({editorState:
          EditorState.createWithContent(Modifier.applyInlineStyle(this.state.editorState.getCurrentContent(), selectionState, 'BOLD'))
        })
      })
  })
  setInterval(this.save, 30000);
}

  // componentWillUnmount =() => {
  //   this.state.socket.off('watchDoc', this.remoteStateChange);
  //   this.state.socket.emit('closeDocument', (this.props.doc._id, this.props.user));
  // }
  //
  // remoteStateChange =(res) => {
  //   this.setState({
  //     editorState: EditorState.createWithContent(convertFromRaw(res.rawState))
  //    });
  // }


  onChange = (editorState) => {
    //step 1
    console.log("On Change", editorState);

    //passed in selection
    var selection= editorState.getSelection();
    this.setState({editorState: editorState}, ()=> {

      this.socket.emit('sync', {id: this.state.doc._id,
        content: convertToRaw(editorState.getCurrentContent()),
        username: this.props.user
      })
    });

    this.socket.emit('selection', { selectionState: selection ,
      color: this.state.colorAssigned, docId: this.state.doc._id }
    )

  };

  focus = () => {
    this.editor.focus();
  };

  //save is called by 30s intervals in componentDidMount
  save = () => {
    fetch('http://localhost:3000/save/'+this.state.doc._id, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        content: JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent())),
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
                ref={(element) => { this.editor = element }}
              />
            </div>
          </div>
        </ScrollArea>
      );
    }
  }
