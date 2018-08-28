import React, { Component } from 'react';

import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import draftToHtml from 'draftjs-to-html';

import { Spin, Icon , List, Avatar, Divider , Row , Col , Button} from 'antd';

import { get } from '../tools/ipfsapi';
import { getTableRows , timeString} from '../request/request.js';


//const { Header, Content, Footer } = Layout;

  var details = '';
  var title = '';
  var action = [];
  var author = '';
  var reply = [];
  const antIcon = <Icon type="loading" style={{ 
    fontSize: 50 ,
    textAlign : 'center' ,    
    width: '300px',
    height: '350px',
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0}} spin />;

// const ReplyItem =  ({text , id}) => ( 
//   <div>
//     <Divider orientation="right">#{id + 1} </Divider>
//     <span style = {{whiteSpace : 'normal' , wordBreak : 'break-all'}}>
//      {text}
//     </span>
//   </div>);
const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 , height: '20px'}} ></Icon>
    {text}
  </span>
);

class Details extends Component {
    constructor(props){
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      loading: true,
      replyd: false,
      edtor: false,
    }
    this.editstyle ={
      height: '300px',
      border: '2px solid #F1F1F1'
    }
  }

  handleEdtor = (event) =>{

    this.setState({
      editorState: EditorState.createEmpty(),
      edtor: true
    })
  }
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  uploadCallBack(file){
    // return new Promise((resolve,reject)=>{
    //   const xhr = new XMLHttpRequest();
    //   xhr.open("POST","http://119.28.52.50:5001/api/v0/add",true);
    //   //xhr.setRequestHeader('Authorization',`PCTOKEN ${Cookie.get('PCTOKEN')}`);
    //   const data=new FormData();
    //   data.append('file',file);
    //   xhr.send(data);
    //   xhr.addEventListener('load',()=>{
    //     const response =JSON.parse(xhr.responseText);
    //     let formdata={
    //       data:{
    //         link:"http://119.28.52.50:8080/ipfs/"+response.Hash
    //       }
    //     }
    //     console.log(response);
    //     resolve(formdata)
    //   });
    //   xhr.addEventListener('error',()=>{
    //     const error=JSON.parse(xhr.responseText);
    //     reject(error);
    //   });
    // });
  }

  enterLoading = () => {
    //this.setState({ loading: true });
    //获取标题、摘要、正文内容
    // const titbuf=Buffer.from(this.state.titleContent);
    // const titBase = titbuf.toString('base64');
    // const titdeBase = new Buffer(titBase,'base64');
    // console.log(titdeBase.toString());

    // const absbuf=Buffer.from(this.state.abstContent);
    // const absBase=absbuf.toString('base64');
    // const absdeBase=new Buffer(absBase,'base64');
    // console.log(absdeBase.toString());


    const htmlCon=draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    const htmbuf=Buffer.from(htmlCon);
    const htmBase=htmbuf.toString('base64');

    var obj ={
      title : '好心人',
      avatar : 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      timestamp : Date.parse(new Date()) / 1000,
      text : htmBase
    }

    reply.push(obj);
    this.setState({ replyd: true });
    this.setState({ edtor: false });

    // const htmdeBase=new Buffer(htmBase,'base64');
    // console.log(htmdeBase.toString());

    // console.log(this.state.styleContent);
    // console.log(this.state.inputValue);

    //上传文章内容到ipfs网络
    // const buffer=Buffer.from(htmBase);
    // add(buffer).then(hash=>{
    //   console.log(hash);
    //   //上传文章到区块链
    //   signfun('wafyartvotes','createart','self',titBase,absBase,hash,'devtest',(this.state.inputValue)*10000);
    //   this.setState({ loading: false });
    //   alert('success');
    // }).catch(err=>{
    //   console.log(err);
    // });
  }



  componentDidMount() {
    // 数据异步请求，请求成功之后setState
    var data = this.props.location.state;
    var {idata} = data;
    //console.log(idata);
    //idata = itdata
    get(idata.arthash)
      .then(data => {
        details = (new Buffer(data.toString() , 'base64')).toString();
        //console.log(htmlToDraft(details));
        title = (new Buffer(idata.title,'base64')).toString();
        action.push(idata.votenum);
        action.push(idata.basetick);
        action.push(idata.timestamp);
        action.push(idata.id);
        author = idata.author;
        this.setState({
          loading: false
        })
      })
      .catch(err => {
        console.log(err);
      });

  }
  render() {
    const { editorState } = this.state;
    //const { inputValue } = this.state;
    return (
      <div>
        {
          this.state.loading
          ? <Spin indicator={antIcon} />
          :<div>
      <h1 ><p style={{textAlign : 'center'}}>{title}</p></h1>
      <span dangerouslySetInnerHTML={{__html: details}} />
               <div><IconText type="user" text={author} />
                  <Divider type="vertical" />
                  <IconText type="like" text={action[0]} />
                  <Divider type="vertical" />
                  <IconText type="pay-circle" text={action[1]} />
                  <Divider type="vertical" />
                  <IconText type="usr" text={timeString(action[2])} />
               </div>
               <hr />
               <div>
                   <Row type="flex" justify="center">
                      <Col span={5}><Button type="primary"  onClick={this.handleEdtor.bind(this)}>我有线索</Button></Col>
                      <Col span={5}><Button>我要投票</Button></Col>
                      <Col span={5}><Button>我要订阅</Button></Col>
                  </Row>
               </div>
               {this.state.edtor ? 
        <div>         
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
              defaultSize:{height:'200'},
            }
          }
          }
        /> 
        <Button type="primary"  onClick={this.enterLoading.bind(this)} style={{ float:'right'}}>
          提交
        </Button>
        </div>: <hr />}
              
        <h3>当前线索</h3>
        
          {this.state.replyd ?   
            <List
              itemLayout="vertical"
              dataSource={reply}
              size="large"
              renderItem={item => (
                <div><Divider />
                <Row>
                  <Col span={2} ><p><Avatar src={item.avatar} /></p><p><a href="/Wallet">{item.title}</a> </p></Col>
                  <Col span={20} >
                <List.Item actions={[timeString(item.timestamp)]}>
                  <List.Item.Meta />
                  <span style = {{whiteSpace : 'normal' , wordBreak : 'break-all'}}
                    dangerouslySetInnerHTML={{__html: (new Buffer(item.text,'base64')).toString()}}
                  />
                </List.Item>
                </Col></Row></div>
              )}
            />
              :null}

          </div>
        }

      </div>
      
    );
  }
}
export default Details;
