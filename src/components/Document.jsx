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
import ColorPicker, { colorPickerPlugin } from 'draft-js-color-picker';

import io from 'socket.io-client'

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
      colorAssigned: '',
      otherSelection: null,
      otherUserColor: '',
    };
    this.getEditorState = () => this.state.editorState;
    this.picker = colorPickerPlugin(this.onChange, this.getEditorState);
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

          this.setState({
            editorState : EditorState.createWithContent(convertFromRaw(JSON.parse(res.document.content))),
            doc: res.document
          })
        }
      }else{ console.log("FETCH FAILED", res)  }

      console.log('frontend connected');
      this.socket.emit('watchDoc', {id: res.document._id, username: this.props.user}, ()=>{
        this.socket.on('joinRoomError', (error) => console.log('room full error', error))

        this.socket.on('update', ({content, username, otherUserColor, otherSelection}) => {
          console.log("@@update color", username, otherUserColor)

          var newContent  = EditorState.createWithContent(convertFromRaw(content));
          var selection = this.state.editorState.getSelection();

          //right cursor and content
          var selectionState = SelectionState.createEmpty();
          selectionState = selectionState.merge(otherSelection);

          var newEditorState = EditorState.createWithContent(Modifier.applyInlineStyle(newContent.getCurrentContent(),selectionState,
          'highlight'+otherUserColor))
           newEditorState = EditorState.forceSelection(newEditorState, selection)

          this.setState({otherSelection:selectionState, otherUserColor: otherUserColor});
          console.log("CONCAT", 'highlight'+otherUserColor);
          this.setState({
            editorState: newEditorState
          })
        })
      });

      //assign color
      this.socket.on('color', (color) => {
        console.log('in 156 color')
        this.setState({colorAssigned: color})
      })
  })
  this.setState({ interval: setInterval(this.save, 30000)})

}

  componentWillUnmount =() => {
    console.log('@@end watchDoc')
    this.socket.off('watchDoc');
    this.socket.off('update');
    this.socket.emit('closeDocument', {
      docId: this.state.doc._id,
      userColor: this.state.colorAssigned}
    );
    this.setState({colorAssigned: ''})
    clearInterval(this.state.interval);
  }
  //
 //  () => {
 //   this.setState({
 //   editorState: EditorState.createWithContent(Modifier.removeInlineStyle(this.editorState.getCurrentContent(),
 //   this.state.otherSelection,
 //   'highlight'+otherUserColor ))})
 // }
  // remoteStateChange =(res) => {
  //   console.log('@@remoteStateChange', res)
  //   this.setState({
  //     editorState: EditorState.createWithContent(convertFromRaw(res.rawState))
  //    });
  // }


  onChange = (editorState) => {
    //step 1
    //passed in selection
    var clearedContent;
    var selection= editorState.getSelection();


    var colorToRemove;
    if(this.state.otherUserColor === ''){
       colorToRemove= this.state.colorAssigned;
    }else{
      colorToRemove = this.state.otherUserColor;
    }
    console.log('@@on change', colorToRemove)


    if(this.state.otherSelection === null) {
      clearedContent = editorState.getCurrentContent();
    }else{
       clearedContent = Modifier.removeInlineStyle(editorState.getCurrentContent(), this.state.otherSelection, 'highlight'+colorToRemove);
    }


    this.setState({editorState: editorState}, ()=> {
      this.socket.emit('sync', {id: this.state.doc._id,
        content: convertToRaw(clearedContent),
        username: this.props.user,
        otherUserColor: this.state.colorAssigned,
        //refers to my own color sent out
        otherSelection: selection
      })
    });

    // this.socket.emit('selection', { selectionState: selection ,
    //   color: this.state.colorAssigned, docId: this.state.doc._id }
    // )
  };

  focus = () => {
    this.editor.focus();
  };

  //save is called by 30s intervals in componentDidMount

  save = () => {
    var saveSelectionYours;
    var saveSelectionOther;
    if(this.state.otherSelection === null){
      saveSelectionYours = this.state.editorState.getSelection()
      saveSelectionOther = this.state.editorState.getSelection()
    } else {
      saveSelectionOther = this.state.otherSelection;
      saveSelectionYours = this.state.editorState.getSelection()
    }

    var colorToRemove;
    if(this.state.otherUserColor === ''){
       colorToRemove= this.state.colorAssigned;
    }else{
      colorToRemove = this.state.otherUserColor;
    }

    var clearedOnce = Modifier.removeInlineStyle(this.state.editorState.getCurrentContent(), saveSelectionYours, 'highlight'+colorToRemove)
    var clearedTwice = Modifier.removeInlineStyle(clearedOnce, saveSelectionOther, 'highlight'+colorToRemove)


    fetch('http://localhost:3000/save/' + this.props.doc._id, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        content: JSON.stringify(convertToRaw(clearedTwice)),
        // content: JSON.stringify(convertToRaw(Modifier.removeInlineStyle(this.state.editorState.getCurrentContent(), saveSelection, 'BOLD'))),
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
        <h1>{this.state.title}</h1>
        <br/>
        <div className="nav">
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

        <h6>History</h6>
        <div className="history">
          {this.state.doc.history
            .filter((version) => this.state.doc.history.indexOf(version)%5 === 0)
            .filter((version) => version.length > 1)
            .map((version) => {
              return (<div
              className="form-signin form-control"
              onClick={() => console.log(typeof version)}>
            <h6>{JSON.stringify(JSON.parse(version).blocks[0].text)}</h6>
          </div>)})}
        </div>
      </div>
      );
    }
  }
