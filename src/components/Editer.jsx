import React, { Component } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
//import htmlToDraft from 'html-to-draftjs';
import { add } from '../tools/ipfsapi';
import { Input, Select, Button, Slider, InputNumber, Row, Col ,Upload, Icon, message} from 'antd';
import { signfun } from '../request/request.js';

const { TextArea } = Input;
const Option = Select.Option;

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('只能上传图片!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片必须小于 2MB!');
  }
  return isJPG && isLt2M;
}

class ControlledEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      loading: false,
      titleContent: '',
      abstContent: '',
      styleContent: 'other',
      inputValue: 10,
      picloading: false,
      curpic:'',
      imageUrl:''
    };
    this.editstyle = {
      height: '300px',
      border: '2px solid #F1F1F1',
    };
    this.handleTitChange = this.handleTitChange.bind(this);
    this.handleAbsChange = this.handleAbsChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
    });
  };
  handleTitChange(event) {
    this.setState({ titleContent: event.target.value });
  }
  handleAbsChange(event) {
    this.setState({ abstContent: event.target.value });
  }
  onSliderChange = value => {
    this.setState({
      inputValue: value,
    });
  };
  uploadCallBack(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://119.28.52.50:5001/api/v0/add', true);
      //xhr.setRequestHeader('Authorization',`PCTOKEN ${Cookie.get('PCTOKEN')}`);
      const data = new FormData();
      data.append('file', file);
      xhr.send(data);
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        let formdata = {
          data: {
            link: 'http://119.28.52.50:8080/ipfs/' + response.Hash,
          },
        };
        console.log(response);
        resolve(formdata);
      });
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    });
  }

  enterLoading = () => {
    this.setState({ loading: true });
    //获取标题、摘要、正文内容
    const titbuf = Buffer.from(this.state.titleContent);
    const titBase = titbuf.toString('base64');
    const titdeBase = new Buffer(titBase, 'base64');
    console.log(titdeBase.toString());

    const absbuf = Buffer.from(this.state.abstContent);
    const absBase = absbuf.toString('base64');
    const absdeBase = new Buffer(absBase, 'base64');
    console.log(absdeBase.toString());

    const htmlCon = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    const htmbuf = Buffer.from(htmlCon);
    const htmBase = htmbuf.toString('base64');
    const htmdeBase = new Buffer(htmBase, 'base64');
    console.log(htmdeBase.toString());

    console.log(this.state.styleContent);
    console.log(this.state.inputValue);

    if(titBase.length>79){
      alert('标题太长了！！！');
      this.setState({ loading: false });
    }else if(absBase.length>399){
      alert('摘要太长了！！！');
      this.setState({ loading: false });
    }else{
      //上传文章内容到ipfs网络
      const buffer = Buffer.from(htmBase);
      add(buffer)
        .then(hash => {
          console.log(hash);
          //上传文章到区块链
          signfun(
            'code',
            'createart',
            'self',
            titBase,
            absBase,
            this.state.curpic,
            hash,
            'devtest',
            this.state.inputValue * 10000
          );
          this.setState({ loading: false });
          //alert('success');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  handleSelectChange(value) {
    this.setState({ styleContent: value });
  }
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ picloading: true });
      return;
    }
  }
  render() {
    const { editorState } = this.state;
    const { inputValue } = this.state;
    const uploadButton = (
      <div>
        <Icon type={this.state.picloading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传照片</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;

    return (
      <div>
        <h3>标题（不超过30字）</h3>
        <TextArea value={this.state.titleContent} onChange={this.handleTitChange} autosize />
        <div style={{ margin: '15px 0' }} />
        <Row><Col span={20}>
        <h3>简介与照片（将会显示在首页，其中简介不超过150字）</h3>
        <TextArea value={this.state.abstContent} onChange={this.handleAbsChange} autosize={{ minRows: 3, maxRows: 6 }} />
        </Col><Col span={1}></Col><Col span={3}>

        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          accept='image/gif,image/jpeg,image/jpg,image/png,image/svg'
          showUploadList={false}
          onChange={this.handleChange}
          action={ (file)=>{
             new Promise((resolve,reject)=>{
              const xhr = new XMLHttpRequest();
              xhr.open("POST","http://119.28.52.50:5001/api/v0/add",true);
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
                this.setState({
                  imageUrl:formdata.data.link,
                  picloading: false,
                  curpic:response.Hash
                });
                console.log(response);
                resolve(formdata.data.link)
                //return '/#/editer';
              });
              xhr.addEventListener('error',()=>{
                const error=JSON.parse(xhr.responseText);
                reject(error);
              });
          });
        }}        
          beforeUpload={beforeUpload}
        >
          {imageUrl ? <img src={imageUrl} width='90px' height='90px' alt="avatar" /> : uploadButton}
        </Upload>
        </Col></Row>
        <div style={{ margin: '15px 0' }} />
        <h3>正文</h3>
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          editorStyle={this.editstyle}
          onEditorStateChange={this.onEditorStateChange}
          toolbar={{
            options: [
              'inline',
              'blockType',
              'fontSize',
              'fontFamily',
              'list',
              'textAlign',
              'colorPicker',
              'image',
            ],
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: true },
            image: {
              urlEnabled: false,
              uploadEnabled: true,
              alignmentEnabled: false,
              uploadCallback: this.uploadCallBack,
              previewImage: true,
              inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
              alt: { present: false, mandatory: false },
              defaultSize: { height: '300' },
            },
          }}
        />
        <div style={{ margin: '15px 0' }} />
        <h3>奖励</h3>
        <Select defaultValue="other" style={{ width: '100%' }} onChange={this.handleSelectChange}>
          <Option value="other">奖励他人（建议寻求帮助者选择）</Option>
          <Option value="self">奖励自己（建议提供帮助者选择）</Option>
        </Select>
        {/*
        <br />
        <h3>预览</h3>
        <br />
        <div dangerouslySetInnerHTML = {{ __html:draftToHtml(convertToRaw(editorState.getCurrentContent()))}}>
        {console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
        </div>
        */}
        <div style={{ margin: '15px 0' }} />
        <h3>支付MZP（默认为最低支付）</h3>
        <Row>
          <Col span={20}>
            <Slider min={10} max={1000} onChange={this.onSliderChange} value={inputValue} />
          </Col>
          <Col span={4}>
            <div style={{ float: 'right' }}>
              <InputNumber
                min={10}
                max={1000}
                style={{ marginLeft: 16 }}
                disabled={true}
                value={inputValue}
                onChange={this.onSliderChange}
              />
            </div>
          </Col>
        </Row>
        <div style={{ margin: '15px 0' }} />
        <div style={{ float: 'right' }}>
          <Button type="primary" loading={this.state.loading} onClick={this.enterLoading}>
            发布!
          </Button>
        </div>
        <br />
      </div>
    );
  }
}

export default ControlledEditor;
