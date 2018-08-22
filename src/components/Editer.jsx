import React, { Component } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import {add,get} from '../tools/ipfsapi';
import { Input,Menu, Dropdown, Button, Icon, message } from 'antd';

const { TextArea } = Input;

function handleButtonClick(e) {
  message.info('Click on left button.');
  console.log('click left button', e);
}

function handleMenuClick(e) {
  message.info('Click on menu item.'+e);
  console.log('click', e);
}

const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1"><Icon type="smile-o" />寻人启事</Menu.Item>
    <Menu.Item key="2"><Icon type="smile-o" />水滴筹</Menu.Item>
    <Menu.Item key="3"><Icon type="smile-o" />追梦分享</Menu.Item>
  </Menu>
);



class ControlledEditor extends Component {
  state = {
    editorState: EditorState.createEmpty(),
    loading: false,
  }
  editstyle ={
    height: '300px',
    border: '2px solid #F1F1F1'
  }

  onEditorStateChange: Function = (editorState) => {
    this.setState({
      editorState,
    });
  };
  uploadCallBack(file){
    return new Promise((resolve,reject)=>{
      const xhr = new XMLHttpRequest();
      xhr.open("POST","http://119.28.52.50:5001/api/v0/add",true);
      //xhr.setRequestHeader('Authorization',`PCTOKEN ${Cookie.get('PCTOKEN')}`);
      const data=new FormData();
      data.append('file',file);
      xhr.send(data);
      xhr.addEventListener('load',()=>{
        const response =JSON.parse(xhr.responseText);
        let formdata={
          data:{
            link:"http://119.28.52.50:8080/ipfs/"+response.Hash
          }
        }
        console.log(response);
        resolve(formdata)
      });
      xhr.addEventListener('error',()=>{
        const error=JSON.parse(xhr.responseText);
        reject(error);
      });
    });
  }

  enterLoading = () => {
    this.setState({ loading: true });
  }

  render() {
    const { editorState } = this.state;
    return (
      <div >
        <h2>标题</h2>
        <TextArea placeholder="添加标题" autosize />
        <div style={{ margin: '15px 0' }} />
        <h2>摘要</h2>
        <TextArea placeholder="在这里添加摘要" autosize={{ minRows: 2, maxRows: 6 }} />
        <div style={{ margin: '15px 0' }} />
        <h2>正文</h2>
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          editorStyle={this.editstyle}
          onEditorStateChange={this.onEditorStateChange}
          toolbar ={{
            options:['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'image'],
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: true },
            image:{
              urlEnabled:false,
              uploadEnabled:true,
              alignmentEnabled:false,
              uploadCallback:this.uploadCallBack,
              previewImage:true,
              inputAccept:'image/gif,image/jpeg,image/jpg,image/png,image/svg',
              alt:{present:false,mandatory:false},
              defaultSize:{height:'300'},
            }
          }
          }
        />
        <div style={{ margin: '15px 0' }} />
        <Dropdown overlay={menu} >
          <Button style={{ marginleft: 8}} block={true}>
            选择分类 <Icon type="down" />
          </Button>
        </Dropdown>
        {/*
        <br />
        <h3>预览</h3>
        <br />
        <div dangerouslySetInnerHTML = {{ __html:draftToHtml(convertToRaw(editorState.getCurrentContent()))}}>
        {console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
        </div>
        */}
        <div style={{ margin: '10px 0' }} />
        <div style={{ float:'right'}} >
        <Button type="primary" loading={this.state.loading} onClick={this.enterLoading}>
          发布!
        </Button>
        </div>
        <br/>
      </div>
    );
  }
}

export default ControlledEditor;

























