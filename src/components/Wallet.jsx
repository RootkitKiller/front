import React, { Component } from 'react';
import { Input, Modal, Row, Col, List, Button ,Drawer,Divider} from 'antd';
import { auth, getTableRows, getAction, signfun } from '../request/request.js';
const { TextArea } = Input;

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eosbalance: '0 EOS',
      mzbalance: '0 MZ',
      mzpbalance: '0 MZP',
      votemzp: '0 MZP',
      unstakemzp: '0 MZP',
      name: 'null',
      actiondata: [],
      mztransable: false,
      mztransto: '接收者账号',
      mztransnum: '发送数目，精确到四位小数，示例：1.0001',
      mztransmemo: '备注信息，选填',
      mzstakeable: false,
      mzstakenum: '抵押数目，精确到四位小数，示例：1.0001',
      mzunstaable: false,
      mzunstanum: '解锁数目，精确到四位小数，示例：1.0001',
      unstakelist: [],
    };
    this.handleMzToChange = this.handleMzToChange.bind(this);
    this.handleMzNumChange = this.handleMzNumChange.bind(this);
    this.handleMzMemoChange = this.handleMzMemoChange.bind(this);
    this.handleMzStakeNumChange = this.handleMzStakeNumChange.bind(this);
    this.handleMzUnstaNumChange = this.handleMzUnstaNumChange.bind(this);
  }
  componentDidMount() {
    if (this.props.location.data !== undefined) {
      //console.log('aaa');
      this.handleGetInfo(this.props.location.data);
    } else {
      document.addEventListener('scatterLoaded', scatterExtension => {
        //console.log(window.scatter)
        this.handleGetInfo(window.scatter);
      });
    }
  }
  convertUTCTimeToLocalTime(utc_datetime) {
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0, T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
    var new_datetime = year_month_day + ' ' + hour_minute_second; // 2017-03-31 08:02:06

    // 处理成为时间戳
    var timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp / 1000;

    // 增加8个小时，北京时间比utc时间多八个时区
    timestamp = timestamp + 8 * 60 * 60;

    // 时间戳转为时间
    var beijing_datetime = new Date(parseInt(timestamp, 10) * 1000)
      .toLocaleString()
      .replace(/年|月/g, '-')
      .replace(/日/g, ' ');
    return beijing_datetime; // 2017-03-31 16:02:06
  }
  handleGetInfo(scatter) {
    try {
      //const scatter = window.scatter;
      //console.log(scatter)
      var tempname = scatter.identity.accounts[0].name;
      if (
        scatter !== null &&
        scatter.identity !== null &&
        scatter.identity.accounts !== null &&
        scatter.identity.accounts[0].name !== null
      ) {
        this.setState({ name: scatter.identity.accounts[0].name });
        this.handleGetBanlance(tempname);
        this.handleGetAction(tempname);
        this.handleGetUnstake(tempname);
      }
    } catch (e) {
      console.log(e);
    }
  }
  handleAuth() {
    auth()
      .then(identity => {
        console.log(identity);
        this.setState({
          isLogin: true,
          identity: identity,
          name: identity.accounts[0].name,
        });
      })
      .catch(error => {
        //...
        console.log('获取身份失败');
      });
  }
  handleGetUnstake(tempname) {
    getTableRows({
      json: true,
      code: 'code',
      scope: tempname,
      table: 'accunstakes',
    }).then(result => {
      //console.log(result);
      try {
        //console.log(result);
        this.setState({
          unstakelist: result.rows,
        });
      } catch (e) {
        console.log(e);
      }
    });
  }
  handleGetBanlance(tempname) {
    getTableRows({
      json: true,
      code: 'token',
      scope: tempname,
      table: 'accounts',
    }).then(result => {
      //console.log(result);
      try {
        this.setState({
          mzbalance: result.rows[0].balance,
        });
      } catch (e) {
        console.log(e);
      }
    });
    getTableRows({
      json: true,
      code: 'eosio.token',
      scope: tempname,
      table: 'accounts',
    }).then(result => {
      //console.log(result);
      try {
        this.setState({
          eosbalance: result.rows[0].balance,
        });
      } catch (e) {
        console.log(e);
      }
    });
    const obj = {
      json: true,
      code: 'code',
      scope: 'code',
      table: 'acctickets',
      lower_bound: tempname,
      limit:1
    };
    getTableRows(obj).then(res => {
      //console.log('aaaa'+res);
      try {
        //console.log('sss'+res);
        if(res.rows[0].byname === tempname){
	        this.setState({
	          mzpbalance: res.rows[0].idletick / 10000.0 + ' MZP',
	          votemzp: res.rows[0].votetick / 10000.0 + ' MZP',
	          unstakemzp: res.rows[0].unstaketick / 10000.0 + ' MZP',
	        });
	    }
      } catch (e) {
        console.log('mzp error:' + e);
      }
    });
  }
  handleGetAction(tempname) {
    getAction({ pos: -1, offset: -20, account_name: tempname }).then(result => {
      //console.log(result);
      try {
        let res = Array.from(new Set(result.actions.reverse()));
        this.setState({
          actiondata: res,
        });
        //console.log(res);
      } catch (e) {
        console.log(e);
      }
    });
  }
  //转移MZ代币弹窗
  showMzTransModal = () => {
    this.setState({
      mztransable: true,
    });
  };

  handleOk = e => {
    console.log(e);
    signfun(
      'token',
      'transfer',
      'self',
      this.state.mztransto,
      this.state.mztransnum + ' MZ',
      this.state.mztransmemo
    );
    this.setState({
      mztransable: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      mztransable: false,
    });
  };
  handleMzToChange(event) {
    this.setState({ mztransto: event.target.value });
  }
  handleMzNumChange(event) {
    this.setState({ mztransnum: event.target.value });
  }
  handleMzMemoChange(event) {
    this.setState({ mztransmemo: event.target.value });
  }
  //抵押MZ代币弹窗
  showMzStakeModal = () => {
    this.setState({
      mzstakeable: true,
    });
  };

  handlestakeOk = e => {
    console.log(e);
    signfun('token', 'staketoken', 'self', this.state.mzstakenum + ' MZ');
    this.setState({
      mzstakeable: false,
    });
  };

  handlestakeCancel = e => {
    console.log(e);
    this.setState({
      mzstakeable: false,
    });
  };
  handleMzStakeNumChange(event) {
    this.setState({ mzstakenum: event.target.value });
  }
  //解锁MZP 代币弹窗
  showMzUnstaModal = () => {
    this.setState({
      mzunstaable: true,
    });
  };
  handleunstaOk = e => {
    console.log(e);
    signfun('code', 'unstaketit', 'self', parseInt(this.state.mzunstanum * 10000.0, 10));
    this.setState({
      mzunstaable: false,
    });
  };

  handleunstaCancel = e => {
    console.log(e);
    this.setState({
      mzunstaable: false,
    });
  };
  handleMzUnstaNumChange(event) {
    this.setState({ mzunstanum: event.target.value });
  }
  timeToDate(timestamp) {
    return new Date(parseInt(timestamp, 10) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
  }
  clickUnstake(ev, id) {
    //撤销解锁
    signfun('code', 'delunstake', 'self', id);
    //console.log(id);
    var temp = [];
    for (var i = 0; i < this.state.unstakelist.length; i++) {
      temp[i] = this.state.unstakelist[i];
      if (id === this.state.unstakelist[i].id.toString()) {
        temp[i].isend = 1;
      }
    }
    //for(var i=0;i<temp.length;i++){
    //	console.log(temp[i].unstakeid);
    //}
    this.setState({ unstakelist: temp });
  }
  showDrawer = (ev,trx) => {
		//console.log(trx);
		trx=JSON.stringify(trx,null,2);
		//console.log(trx);
	    this.setState({
	      visible: true,
	      curtrx:trx
	    });
  };
  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const data = [
      {
        msg: 'EOS 代币余额：',
        balance: this.state.eosbalance,
      },
      {
        msg: 'MZ 代币余额：',
        balance: this.state.mzbalance,
      },
      {
        msg: 'MZP 代币余额：',
        balance: this.state.mzpbalance,
      },
      {
        msg: '投票中的MZP：',
        balance: this.state.votemzp,
      },
      {
        msg: '解锁中的MZP：',
        balance: this.state.unstakemzp,
      },
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
          <Row>
            <Col span={22}>
              <TextArea value={this.state.mztransnum} onChange={this.handleMzNumChange} autosize />
            </Col>
            <Col span={2}>&nbsp;MZ</Col>
          </Row>
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
          <Row>
            <Col span={22}>
              <TextArea
                value={this.state.mzstakenum}
                onChange={this.handleMzStakeNumChange}
                autosize
              />
            </Col>
            <Col span={2}>&nbsp;MZP</Col>
          </Row>
        </Modal>

        <Modal
          title="MZP Token 解锁"
          visible={this.state.mzunstaable}
          onOk={this.handleunstaOk}
          onCancel={this.handleunstaCancel}
        >
          <h4>数目</h4>
          <Row>
            <Col span={22}>
              <TextArea
                value={this.state.mzunstanum}
                onChange={this.handleMzUnstaNumChange}
                autosize
              />
            </Col>
            <Col span={2}>&nbsp;MZ</Col>
          </Row>
        </Modal>

        <Col span={18}>
          <h3 style={{ marginBottom: 16 }}>我的资产</h3>
          <List
            bordered
            dataSource={data}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta description={item.msg} />
                <div style={{ float: 'right' }}>{item.balance}</div>
              </List.Item>
            )}
          />
          <br />
          <h3 style={{ marginBottom: 16 }}>解锁记录（解锁期为三天）</h3>
          <List
            bordered
            dataSource={this.state.unstakelist}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    disabled={item.isend === 1 ? 'true' : ''}
                    onClick={ev => {
                      this.clickUnstake(ev, item.id);
                    }}
                  >
                    撤销解锁
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  description={
                    <div>
                      <p>
                        {'时间：' + this.timeToDate(item.timestamp)}
                        &nbsp;&nbsp;&nbsp;
                        {'数量：' + item.amount / 10000.0 + ' MZP'}
                        &nbsp;&nbsp;&nbsp;
                        {'状态：' + (item.isend === 1 ? '已完成' : '解锁中')}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <br />
          <h3 style={{ marginBottom: 16 }}>操作记录</h3>
          <List
            bordered
            dataSource={this.state.actiondata}
            renderItem={item => (
              <List.Item actions={[<a onClick={(ev)=>{this.showDrawer(ev,item)}}>查看更多</a>]}>
                <List.Item.Meta
                  title={
                    <p>
                      {'合约：' + item.action_trace.act.account}
                      &nbsp;&nbsp;
                      {'接口：' + item.action_trace.act.name}
                      &nbsp;&nbsp;
                      {'时间：' + this.convertUTCTimeToLocalTime(item.block_time + 'Z')}
                    </p>
                  }
                  description={
                    <div>
                      <p>{'交易id：' + item.action_trace.trx_id}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <br />
          <Drawer
          	width={'25%'}
          	placement="right"
          	closable={false}
          	onClose={this.onClose}
          	visible={this.state.visible}>	          
	          <p >详细记录</p>	          
	          <Divider />
	          <pre >{this.state.curtrx}</pre>
			          
		   </Drawer>
        </Col>
        <Col span={1} />
        <Col span={5}>
          <h3 style={{ marginBottom: 16 }}>钱包功能</h3>
          <div>
            <Button type="primary" onClick={this.showMzTransModal} block>
              MZ代币转账
            </Button>
          </div>
          <br />
          <div>
            <Button type="primary" onClick={this.showMzStakeModal}>
              抵押代币
            </Button>
            <div style={{ float: 'right' }}>
              <Button type="primary" onClick={this.showMzUnstaModal}>
                解锁代币
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}
export default Wallet;
