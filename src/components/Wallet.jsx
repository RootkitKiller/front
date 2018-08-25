import React, { Component } from 'react';
import {Input,Modal,Row,Col,List,Button} from 'antd';
import { auth,getTableRows,getAction,signfun } from '../request/request.js';
const { TextArea } = Input;


class Wallet extends Component {

	constructor(props){
    	super(props);
    	this.state ={
    		eosbalance:'0 EOS',
    		mzbalance:'0 MZ',
    		mzpbalance:'0 MZP',
    		votemzp:'0 MZP',
    		unstakemzp:'0 MZP',
    		name:'null',
    		actiondata:[],
    		mztransable: false,
    		mztransto:'接收者账号',
    		mztransnum:'发送数目，精确到四位小数，示例：1.0001',
    		mztransmemo:'备注信息，选填',
    		mzstakeable: false,
    		mzstakenum:'抵押数目，精确到四位小数，示例：1.0001', 
    		mzunstaable: false,
    		mzunstanum:'解锁数目，精确到四位小数，示例：1.0001'
    	}
    	this.handleMzToChange=this.handleMzToChange.bind(this);
    	this.handleMzNumChange=this.handleMzNumChange.bind(this);
    	this.handleMzMemoChange=this.handleMzMemoChange.bind(this);
    	this.handleMzStakeNumChange=this.handleMzStakeNumChange.bind(this);
    	this.handleMzUnstaNumChange=this.handleMzUnstaNumChange.bind(this);
    }   	
    componentDidMount(){
	   	document.addEventListener('scatterLoaded', scatterExtension => {
	   		this.handleGetInfo();
	    });	
  	}
  	handleGetInfo(){
  		try{
	    	const scatter = window.scatter;
	    	if(scatter!==null && scatter.identity !==null && scatter.identity.accounts!==null){
	      		this.setState({name:scatter.identity.accounts[0].name});
	      		this.handleGetBanlance();
	      		this.handleGetAction();
	      	}	
	  	}catch(e){
	  		console.log(e);
	  	}
  	}
  	handleAuth(){
	    auth().then(identity => {
	      console.log(identity);
	      this.setState({ isLogin:true, identity: identity,name:identity.accounts[0].name});

	    }).catch(error => {
	        //...
	        console.log("获取身份失败");
	    });
  	}
  	handleGetBanlance(){
	    getTableRows({json:true,code:'wafyarttoken',scope:this.state.name,table:'accounts'}).then(result => {
	      //console.log(result);
	      try{
		    this.setState({
		      mzbalance: result.rows[0].balance
		     });
		  }catch(e){
		  	console.log(e);
		  }
	    });
	    getTableRows({json:true,code:'eosio.token',scope:this.state.name,table:'accounts'}).then(result => {
	      //console.log(result);
	      try{
		    this.setState({
		      eosbalance: result.rows[0].balance
		     });
		  }catch(e){
		  	console.log(e);
		  }
	    });
	    const obj={
	    	json:true,
	    	code:'wafyartvotes',
	    	scope:'wafyartvotes',
	    	table:'acctickets',
	    	lower_bound:this.state.name
	    }
	    getTableRows(obj).then(res=>{
	    	//console.log('aaaa'+res);
	    	try{
	    		//console.log('sss'+res);
	    		this.setState({
	    			mzpbalance:(res.rows[0].idletick)/10000.0000+' MZP',
	    			votemzp:(res.rows[0].votetick)/10000.0000+' MZP',
	    			unstakemzp:(res.rows[0].unstaketick)/10000.0000+' MZP'
	    		});
	    	}catch(e){
	    		console.log('mzp error:'+e);
	    	}
	    });
  	}
  	handleGetAction(){
  		getAction({pos:-1,offset:-20,account_name:this.state.name}).then(result => {
	      //console.log(result);
	      try{
	      	let res=Array.from(new Set((result.actions).reverse()));
		    this.setState({
		      actiondata:res
		     });
		     console.log(res);
		  }catch(e){
		  	console.log(e);
		  }
	    });
  	}
  	//转移MZ代币弹窗
  	showMzTransModal = () => {
	    this.setState({
	      mztransable: true,
	    });
	}

	handleOk = (e) => {
	    console.log(e);
	    signfun('wafyarttoken','transfer','self',this.state.mztransto,this.state.mztransnum+' MZ',this.state.mztransmemo);
	    this.setState({
	      mztransable: false,
	    });
	}

	handleCancel = (e) => {
	    console.log(e);
	    this.setState({
	      mztransable: false,
	    });
	}
	handleMzToChange(event){
    	this.setState({mztransto:event.target.value});
  	}
  	handleMzNumChange(event){
    	this.setState({mztransnum:event.target.value});
  	}
  	handleMzMemoChange(event){
    	this.setState({mztransmemo:event.target.value});
  	}
  	//抵押MZ代币弹窗
  	showMzStakeModal = () => {
	    this.setState({
	      mzstakeable: true,
	    });
	}

	handlestakeOk = (e) => {
	    console.log(e);
	    signfun('wafyarttoken','staketoken','self',this.state.mzstakenum+' MZ');
	    this.setState({
	      mzstakeable: false,
	    });
	}

	handlestakeCancel = (e) => {
	    console.log(e);
	    this.setState({
	      mzstakeable: false,
	    });
	}
  	handleMzStakeNumChange(event){
    	this.setState({mzstakenum:event.target.value});
  	}
  	//解锁MZP 代币弹窗
  	showMzUnstaModal = () => {
	    this.setState({
	      mzunstaable: true,
	    });
	}
	handleunstaOk = (e) => {
	    console.log(e);
	    signfun('wafyartvotes','unstaketit','self',this.state.mzunstanum*10000.0000);
	    this.setState({
	      mzunstaable: false,
	    });
	}

	handleunstaCancel = (e) => {
	    console.log(e);
	    this.setState({
	      mzunstaable: false,
	    });
	}
  	handleMzUnstaNumChange(event){
    	this.setState({mzunstanum:event.target.value});
  	}

   	render() {
  		const data = [
		  {
		  	msg:'EOS 代币余额：',
		  	balance:this.state.eosbalance
		  },
		  {
		  	msg:'MZ 代币余额：',
		  	balance:this.state.mzbalance
		  },
		  {
		  	msg:'MZP 代币余额：',
		  	balance:this.state.mzpbalance
		  },
		  {
		  	msg:'投票中的MZP：',
		  	balance:this.state.votemzp
		  },{
		  	msg:'解锁中的MZP：',
		  	balance:this.state.unstakemzp
		  }
		];
	    return (
	      	<Row>
			    <Modal
		          title="MZ Token 转账"
		          visible={this.state.mztransable}
		          onOk={this.handleOk}
		          onCancel={this.handleCancel}
		        >
		         <h4>发送到</h4>
       			 <TextArea value={this.state.mztransto} onChange={this.handleMzToChange} autosize />
       			 <h4>数目</h4>
       			 <Row><Col span={22}>
       			 <TextArea value={this.state.mztransnum} onChange={this.handleMzNumChange} autosize />
       			 </Col><Col span={2}>&nbsp;MZ</Col></Row>
       			 <h4>备注</h4>
       			 <TextArea value={this.state.mztransmemo} onChange={this.handleMzMemoChange} autosize />

		        </Modal>

		        <Modal
		          title="MZ Token 抵押"
		          visible={this.state.mzstakeable}
		          onOk={this.handlestakeOk}
		          onCancel={this.handlestakeCancel}
		        >
       			 <h4>数目</h4>
       			 <Row><Col span={22}>
       			 <TextArea value={this.state.mzstakenum} onChange={this.handleMzStakeNumChange} autosize />
       			 </Col><Col span={2}>&nbsp;MZP</Col></Row>
		        </Modal>

		        <Modal
		          title="MZP Token 解锁"
		          visible={this.state.mzunstaable}
		          onOk={this.handleunstaOk}
		          onCancel={this.handleunstaCancel}
		        >
       			 <h4>数目</h4>
       			 <Row><Col span={22}>
       			 <TextArea value={this.state.mzunstanum} onChange={this.handleMzUnstaNumChange} autosize />
       			 </Col><Col span={2}>&nbsp;MZ</Col></Row>
		        </Modal>

	      		<Col span={18}>
	      			<h3 style={{ marginBottom: 16 }}>我的资产</h3>
				    <List
				      bordered
				      dataSource={data}
				      renderItem={item =>(
				      	<List.Item>
				      		<List.Item.Meta description={item.msg}/>
			      			<div style={{float:'right'}}>
				      			{item.balance}
				      		</div>
				      	</List.Item>)}
				    />
				    <br />
				    <h3 style={{ marginBottom: 16 }}>我的记录</h3>
				    <List
				      bordered
				      dataSource={this.state.actiondata}
				      renderItem={item =>(
				      	<List.Item>
				      		<List.Item.Meta 
				      			title={<p>{'合约：'+item.action_trace.act.account}&nbsp;&nbsp;{'接口：'+item.action_trace.act.name}&nbsp;&nbsp;{'时间：'+item.block_time}</p>}
				      			description={<div>
				      				<p>{'交易id：'+item.action_trace.trx_id}</p></div>}/>
				      	</List.Item>)}
				    />
				    <br />
	      		</Col>
	      		<Col span={1}>
	      		</Col>
	      		<Col span={5}>
	      			<h3 style={{ marginBottom: 16 }}>钱包功能</h3>
	      			<div>
	      				<Button type="primary" onClick={this.showMzTransModal} block>MZ代币转账</Button>
	      			</div>
	      			<br/>
	      			<div>
	      				<Button type="primary" onClick={this.showMzStakeModal}>抵押代币</Button>
	      				<div style={{float:'right'}}>
	      					<Button type="primary" onClick={this.showMzUnstaModal}>解锁代币</Button>
	      				</div>
	      			</div>
	      		</Col>
	    	</Row>    
	    );
	  }
}
export default Wallet;