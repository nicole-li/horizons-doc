import React, { Component } from 'react';

import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';

import {EditorState, RichUtils} from 'draft-js';

import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import ScrollArea from 'react-scrollbar';
import ColorPicker, { colorPickerPlugin } from 'draft-js-color-picker';

const presetColors = [
  '#ff00aa',
  '#F5A623',
  '#F8E71C',
  '#8B572A',
  '#7ED321',
  '#417505',
  '#BD10E0',
  '#9013FE',
  '#4A90E2',
  '#50E3C2',
  '#B8E986',
  '#000000',
  '#4A4A4A',
  '#9B9B9B',
  '#FFFFFF',
];

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
  'highlightred': {
    backgroundColor: 'red'
  },
  'highlightblue': {
    backgroundColor: 'blue'
  },
  'highlightgreen': {
    backgroundColor: 'green'
  },
  'highlightorange': {
    backgroundColor: 'orange'
  },
  'highlightyellow': {
    backgroundColor: 'yellow'
  },
  'highlightpurple': {
    backgroundColor: 'purple'
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
  'SMALL': {
    fontSize: '8px',
  },
  'MEDIUM': {
    fontSize: '12px',
  },
  'LARGE': {
    fontSize: '16px',
  },
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
    this.onChange = (editorState) => this.setState({editorState});
    this.getEditorState = () => this.state.editorState;
    this.picker = colorPickerPlugin(this.onChange, this.getEditorState);
  }

  componentDidMount() {
    this.props.doc["collaboratorList"].map((id) => {
      fetch('http://localhost:3000/collaborator/'+id, {
        credentials: 'same-origin',
      })
      .then(resp => resp.json())
      .then(json => {
        if (json.success) {
          // console.log('user: ', json.user);
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
    // .then((json) => console.log(json))
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

  toggleInlineStyle(e, inlineStyle) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle))
  }

  toggleBlockType(e, blockType) {
    e.preventDefault();
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType))
  }

  render() {
    return (
      <div className="pageContainer">
        <h1>Document Editor</h1>
        <div className="nav">
          <input style={{textAlign: 'center'}} onChange={(e) => this.setState({title: e.target.value})} value={this.state.title}/>
          <button className="btn btn-light" onClick={()=>{this.props.redirect('Home')}}>Home</button>
          <button className="btn btn-light" type='submit'onClick={this.openModal}>Share</button>
        </div>

        <br></br>

        <Modal
          isOpen={this.state.modalIsOpen}
          // onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h3>Share</h3>
          {this.state.collaborators.map((user) => <p key={user._id}>{user.username}</p>)}
          <div className="nav">
            <input onChange={(e) => this.setState({toUser: e.target.value})} value={this.state.toUser}/>
            <button className="btn btn-light" onClick={this.share}>Share</button>
            <button className="btn btn-light" onClick={this.closeModal}>Cancel</button>
          </div>
        </Modal>

        <div className="toolbar">
          <ColorPicker
           toggleColor={color => this.picker.addColor(color)}
           presetColors={presetColors}
           color={this.picker.currentColor(this.state.editorState)}
          />
          <button onMouseDown={e => this.toggleInlineStyle(e, 'BOLD')}>B</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'ITALIC')}>I</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'UNDERLINE')}>U</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'STRIKETHROUGH')}>S</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'UPPERCASE')}>ABC</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'LOWERCASE')}>xyz</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'unordered-list-item')}>Bulleted List</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'ordered-list-item')}>Numbered List</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-one')}>H1</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-two')}>H2</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-three')}>H3</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-four')}>H4</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-five')}>H5</button>
          <button onMouseDown={e => this.toggleBlockType(e, 'header-six')}>H6</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'SUPERSCRIPT')}>Superscript</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'SUBSCRIPT')}>Subscript</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'HIGHLIGHT')}>Highlight</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'SMALL')}>Small</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'MEDIUM')}>Medium</button>
          <button onMouseDown={e => this.toggleInlineStyle(e, 'LARGE')}>Large</button>
        </div>

        <div className='editor'>
          <Editor
            customStyleFn={this.picker.customStyleFn}
            blockStyleFn={this.alignBlock}
            customStyleMap={styleMap}
            editorState={this.state.editorState}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}
