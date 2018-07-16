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
  AlignBlockCenterButton,
  AlignBlockDefaultButton,
  AlignBlockLeftButton,
  AlignBlockRightButton
} from 'draft-js-buttons';

import {EditorState, RichUtils} from 'draft-js';

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
          H
        </button>
      </div>
    );
  }
}

class FontSizeButton extends Component {
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

// class FontPicker extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       editorState: EditorState.createEmpty()
//     };
//     this.onChange = (editorState) => this.setState({editorState});
//   }
//
//   onFontChange = (num) => {
//     console.log('here', num);
//     this.onChange(RichUtils.toggleInlineStyle(
//       this.state.editorState, `FONT_SIZE_40`
//     ));
//   }
//
//   render() {
//     return (
//       <div>
//         <input onChange={this.onFontChange} type='text' placeholder='font size'/>
//       </div>
//     );
//   }
// }

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
    AlignBlockCenterButton,
    AlignBlockDefaultButton,
    AlignBlockLeftButton,
    AlignBlockRightButton,
    FontSizeButton
  ]
});
const { Toolbar } = toolbarPlugin;
const plugins = [toolbarPlugin];
const text = 'Write somethings…';

export default class CustomToolbarEditor extends Component {

  state = {
    editorState: createEditorStateWithText(text),
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  save = (e) => {
    fetch('/save', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: this.state.editorState,
        lastEditTime: new Date()
      })
    })
    .then((response) => response.json())
    .then((responseJson) => console.log(responseJson))
  }

  render() {
    return (
      <div>
        <div className='editor' onClick={this.focus}>
          <Toolbar />
          <p/>
          <Button type='submit'onClick={this.save}/>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
        </div>
      </div>
    );
  }
}
