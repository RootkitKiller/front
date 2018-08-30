import React, { Component } from 'react';

import {Link} from "react-router-dom";

import { Spin, Icon , List , Divider , Row , Col , Button , Popover , Input} from 'antd';

import { get } from '../tools/ipfsapi';
import { getTableRows , timeString , signfun} from '../request/request.js';



  var action = {};
  var replyFis = [];
  var replySec = [];
  var replylist = {};
  var caname = '';
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

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 , height: '20px'}} ></Icon>
    {text}
  </span>
);

class Show extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bool: false,
      parid : -1,
    }
  }

  handleMessage = (event) =>{
    this.setState({
      parid : parseInt(event.target.id.slice(1)),
    });
  }
  handleDelete = (event) =>{
    var id = event.target.id.split(':');
    signfun('code','deletecom','self',parseInt(id[0]),caname,parseInt(id[1])); 
  }
  handleLike = (event) =>{
    this.setState({
      bool: true
    })  
    event.target.style.color = '#f50';
  }
  handleClick = (value) =>{
    if(!(this.state.parid < 0)){
      signfun('code','createcom','self',(Buffer.from(value)).toString('base64'),caname,this.state.parid,2);
    }
    this.setState({
      parid : -1,
    });
  }
  componentDidMount(){
  }
  render(){
    return(   
          <List
              itemLayout="vertical"
              dataSource={replyFis}
              size="large"
              renderItem={item => (
                <div>
                <Divider />
                <List.Item actions={
                                     [<Link to="/Wallet">{item.author}</Link>,
                                     timeString(item.timestamp) , 
                                     <i className="anticon anticon-heart" onClick={this.handleLike} id={`L${item.id}`} style = {(item.isbest)? {color: '#f50'} : null }/>,
                                     <i className="anticon anticon-delete" onClick={this.handleDelete}  id={`${item.id}:${item.indexnum}`}/>,  
                                     //<PopInput onMouseOver={this.handleMessage} id={`M${item.id}`}/>,
                                     (item.indexnum != 2) ? <Popover placement="top" content={ <Input.Search enterButton="提交" size="large"  onSearch={value =>this.handleClick(value)} />} 
                                              trigger="click">
                                        <i className="anticon anticon-message" onClick={this.handleMessage} id={`M${item.id}`}/> 
                                     </Popover> : <i className="anticon anticon-message" style={{background: '#ddd'}}/>
                                     ]}>
                  <List.Item.Meta description={(item.indexnum === 2) ? <div style={{background: '#ddd'}}>回复：{(new Buffer(replylist[item.parid],'base64')).toString()} </div>: null}                
                  />
                  <span style = {{whiteSpace : 'normal' , wordBreak : 'break-all'}}>
                    {(new Buffer(item.comcontent,'base64')).toString()}
                  </span>
                </List.Item>
                </div>
              )}
            />
    );
  }
}

class Details extends Component {
    constructor(props){
    super(props);
    this.state = {
      Comment: '',
      replyd: false,
      edtor: false,
      loading : true,
      artdetails : '',
      arttitle : '',
    }
    this.editstyle ={
      height: '300px',
      border: '2px solid #F1F1F1'
    }
  }

  handleEdtor = (event) =>{
    this.setState({
      edtor: true
    })
  }
  handleComment = (event) =>{
    this.setState({
      Comment: event.target.value
    })
  }

  enterLoading = () => {
    this.setState({ replyd: false });  
    const htmBase=(Buffer.from(this.state.Comment)).toString('base64');
    signfun('code','createcom','self',htmBase,caname,action.id,1);
    this.setState({ edtor: false });  
    this.getFirstComm();
  }
 getFirstComm () {
    this.setState({ replyd: false });
    replyFis = [];
      getTableRows({json:true,code:'code',scope: caname,table:'comments',key_type:'i64',index_position:'2',lower_bound:action.id,upper_bound:action.id + 1}).then(data => {
  	      try{
              replyFis = data.rows;
              let tmp = replyFis.length - 1;
              replySec = [];
              replylist = {};
              replyFis.map((iter,key) => {
                getTableRows({json:true,code:'code',scope: caname,table:'comments',key_type:'i64',index_position:'2',lower_bound:iter.id,upper_bound:iter.id + 1}).then(data => {
  	              try{		       
                      replySec = replySec.concat(data.rows);
                      replylist[iter.id] = iter.comcontent;
                      if(key === tmp){
                        replyFis = replyFis.concat(replySec);
                        this.setState({ replyd: true }); 
                      }
                     }catch(e){
		  	            console.log(e);
		              }});
              });
		          }catch(e){
		  	        console.log(e);
		        }});
  }

  componentDidMount() {
    // 数据异步请求，请求成功之后setState
    var data = this.props.location.state;
    var {idata , catename } = data;
    caname = catename;
    get(idata.arthash)
      .then(data => {
        this.setState({
          artdetails : (new Buffer(data.toString() , 'base64')).toString(),
          arttitle : (new Buffer(idata.title,'base64')).toString()
        });
        action = idata;
        this.getFirstComm(); 
        this.setState({
          loading : false,
          replyd : true,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <div>
        {
          this.state.loading
          ? <Spin indicator={antIcon} />
          : <div>
              <h1 ><p style={{textAlign : 'center'}}>{this.state.arttitle}</p></h1>
              <span dangerouslySetInnerHTML={{__html: this.state.artdetails}} />
               <div><IconText type="user" text={action.author} />
                  <Divider type="vertical" />
                  <IconText type="like" text={action.votenum} />
                  <Divider type="vertical" />
                  <IconText type="pay-circle" text={action.basetick / 10000.0000 } />
                  <Divider type="vertical" />
                  <IconText type="usr" text={timeString(action.timestamp)} />
               </div>
               <hr />
               <div>
                   <Row type="flex" justify="center">
                      <Col span={5}><Button type="primary"  onClick={this.handleEdtor.bind(this)}>我有线索</Button></Col>
                      <Col span={5}><Button>我要投票</Button></Col>
                      <Col span={5}><Button>我要订阅</Button></Col>
                  </Row>
               </div>
               { this.state.edtor ? 
        <div style={{ margin: '24px 0' }}>         
          <Input.TextArea value={this.state.Comment} onChange={this.handleComment} autosize={{ minRows: 2, maxRows: 6 }}/>
          <Button  onClick={this.enterLoading.bind(this)} style={{ float:'right'}}>
            提交
          </Button>
        </div>: <hr />}
              
        <h3>当前线索</h3>      
          {this.state.replyd ?  <Show /> : <Spin indicator={antIcon} />}
         </div>
        }

      </div>
      
    );
  }
}
export default Details;
