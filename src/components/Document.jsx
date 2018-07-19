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
  CodeBlockButton,
  SubButton,
  SupButton,
  HighlightButton,
  StrikeThroughButton,
  LowercaseButton,
  UppercaseButton,
  ColorButton
} from 'draft-js-buttons';

import {EditorState, RichUtils} from 'draft-js';

import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import ScrollArea from 'react-scrollbar';

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
          Title
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
    CodeBlockButton,
    SubButton,
    SupButton,
    ColorButton,
    HighlightButton,
    StrikeThroughButton,
    LowercaseButton,
    UppercaseButton
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

const styleMap = {
  'HIGHLIGHT': {
    backgroundColor: 'lightgreen'
  },
  'SUBSCRIPT': {
    fontSize: '0.6em',
    verticalAlign: 'sub'
  },
  'SUPERSCRIPT': {
    fontSize: '0.6em',
    verticalAlign: 'super'
   },
  'UPPERCASE': {
    textTransform: 'uppercase'
  },
  'LOWERCASE': {
    textTransform: 'lowercase'
  },
  'STRIKETHROUGH': {
    textDecoration: 'line-through'
  },
  'COLOR': {
    color: 'red'
  }
};

export default class CustomToolbarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      toUser: '',
      title: this.props.doc['title'],
      collaborators: []
    };
    if (this.props.doc['content'].length === 0) {
      this.state.editorState = EditorState.createEmpty();
    }
    else {
      this.state.editorState = createEditorStateWithText(this.props.doc['content'].join())
    }
  }

  componentDidMount() {
    this.props.doc["collaboratorList"].map((id) => {
      fetch('http://localhost:3000/collaborator/'+id, {
        credentials: 'same-origin',
      })
      .then(resp => resp.json())
      .then(json => {
        if (json.success) {
          console.log('user: ', json.user);
          this.setState({
            collaborators: this.state.collaborators.concat([json.user])
          })
        }
        else {
          console.log('Could not create display collaborators: ' + json.error);
        }
      })
    })
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  save = () => {
    fetch('http://localhost:3000/save/'+this.props.doc.docId, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        content: this.state.editorState,
        lastEditTime: Date.now()
      })
    })
    .then((response) => response.json())
    .then((responseJson) => console.log(responseJson))
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
    .then(this.closeModal)
  }

  isSelection = (editorState) => {
    const selection = editorState.getSelection();
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();
    return start !== end;
  };

  highlight = (editorState) => {
    if (!this.isSelection(editorState)) {
      return;
    }
    editorState = RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT');
    // using concise obj prop notation short for {editorState:editorState}
    this.setState({editorState});
  }

  render() {
    return (
      <ScrollArea>
      <div className="pageContainer">
        <h1>Document Editor</h1>
        <div className="nav">
          <button className="button" onClick={()=>{this.props.redirect('Home')}}>Home</button>
          <button className="button" type='submit'onClick={this.openModal}>Share</button>
        </div>
        <input className="title" onChange={(e) => this.setState({title: e.target.value})} value={this.state.title}/>

        <Modal
          isOpen={this.state.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h3>Share</h3>
          <p>Shared With: {this.state.collaborators.map((user) => user.username)}</p>
          <div>
            <input onChange={(e) => this.setState({toUser: e.target.value})} value={this.state.toUser}/>
            <button onClick={this.share}>Share</button>
            <button onClick={this.closeModal}>Cancel</button>
          </div>
        </Modal>

        <Toolbar />
        <div className='editor' onClick={this.focus}>
          <Editor
            customStyleMap={styleMap}
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
