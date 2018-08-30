import React from 'react';

import { Collapse } from 'antd';

import { List, Button, Spin, Icon, Row, Col, Modal, Input, Card } from 'antd';

import { getTableRows, signfun } from '../request/request.js';

//const fakeDataUrl = 'https://randomuser.me/api/?results=5&inc=name,gender,email,nat&noinfo';

const Panel = Collapse.Panel;

const { TextArea } = Input;

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

var i = 0;
const antIcon = (
  <Icon
    type="loading"
    style={{
      fontSize: 50,
      textAlign: 'center',
      width: '300px',
      height: '350px',
      margin: 'auto',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
    spin
  />
);

class Sr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      catelist: [],
      audlist: [],
      votenum: '投票数目，精确到四位小数，示例：1.0001',
      voteable: false,
      curauditor: '',
      curcatename: '',
      curname: '',
    };
    this.handleVoteNumChange = this.handleVoteNumChange.bind(this);
  }
  componentDidMount() {
    // 数据异步请求，请求成功之后setState
    this.getAudlist();
    if (this.props.location.data !== undefined) {
      //console.log('aaaa');
      this.setname(this.props.location.data.identity.accounts[0].name);
    } else {
      document.addEventListener('scatterLoaded', scatterExtension => {
        //console.log(window.scatter)
        var scatter = window.scatter;
        if (
          scatter != null &&
          scatter.identity != null &&
          scatter.identity.accounts != null &&
          scatter.identity.accounts[0].name != null
        ) {
          this.setname(window.scatter.identity.accounts[0].name);
        }
      });
    }
  }
  getAudlist() {
    getTableRows({
      json: true,
      code: 'code',
      scope: 'code',
      table: 'cates',
    }).then(data => {
      var listaud = [];
      try {
        this.setState({
          catelist: data.rows,
        });
        //console.log(this.state.catelist)
        for (let i = 0; i < this.state.catelist.length; i++) {
          getTableRows({
            json: true,
            code: 'code',
            scope: this.state.catelist[i].catename,
            table: 'auditorlists',
            key_type: 'i64',
            index_position: '2',
          }).then(data => {
            try {
              listaud[i] = data.rows.reverse();
              listaud[i].catename = this.state.catelist[i].catename;
              this.setState({
                loading: false,
              });
            } catch (e) {
              console.log(e);
            }
          });
        }
        this.setState({
          audlist: listaud,
        });
        //console.log(this.state.audlist);
      } catch (e) {
        console.log(e);
      }
    });
  }
  showVoteModal = (ev, auditor, catename) => {
    this.setState({
      voteable: true,
      curauditor: auditor,
      curcatename: catename,
    });
  };

  handleVoteOk = e => {
    //console.log(e);
    //console.log(this.state.curauditor);
    //console.log(this.state.curcatename);
    signfun(
      'code',
      'voteaud',
      'self',
      parseInt(this.state.votenum * 10000.0, 10),
      this.state.curcatename,
      this.state.curauditor
    );
    this.setState({
      voteable: false,
    });
  };

  handleVoteCancel = e => {
    //console.log(e);
    this.setState({
      voteable: false,
    });
  };
  handleVoteNumChange(event) {
    this.setState({ votenum: event.target.value });
  }
  contains(catename, auditor) {
    var audlength = this.state.audlist.length;
    //console.log(audlength);
    while (audlength--) {
      //console.log(this.state.audlist[audlength].catename)
      if (this.state.audlist[audlength].catename === catename) {
        //console.log(this.state.audlist[audlength])
        var catelength = this.state.audlist[audlength].length;
        //console.log(i);
        for (var i = 0; i < catelength; i++) {
          if (auditor === this.state.audlist[audlength][i].auditor) {
            //console.log(i);
            return i;
          }
        }
      }
    }
    return -1;
  }
  regaudit(ev, catename) {
    if (this.contains(catename, this.state.curname) > 0) {
      var num = parseInt(this.contains(catename, this.state.curname), 10) + 1;
      alert('错误：已经在审核员列表中了，排名在第' + num + '位');
    } else {
      signfun('code', 'regauditor', 'self', catename);
      this.getAudlist();
    }
  }
  logoutaudit(ev, catename) {
    if (this.contains(catename, this.state.curname) < 0) {
      alert('错误：您目前不是审核者，不用退出');
    } else {
      signfun('code', 'delauditor', 'self', catename);
      this.getAudlist();
    }
  }
  setname(name) {
    this.setState({
      curname: name,
    });
    //console.log(name)
  }
  render() {
    i = 0;
    //console.log(this.state.curname)
    return (
      <div>
        {this.state.loading ? (
          <Spin indicator={antIcon} />
        ) : (
          <div>
            <Collapse bordered={false} defaultActiveKey={['1']} accordion>
              {this.state.catelist.map(iter => {
                i = i + 1;
                return (
                  <Panel header={iter.catename} key={i} style={customPanelStyle}>
                    <Modal
                      title="审核者投票"
                      visible={this.state.voteable}
                      onOk={this.handleVoteOk}
                      onCancel={this.handleVoteCancel}
                    >
                      <h4>数目</h4>
                      <Row>
                        <Col span={22}>
                          <TextArea
                            value={this.state.votenum}
                            onChange={this.handleVoteNumChange}
                            autosize
                          />
                        </Col>
                        <Col span={2}>&nbsp;MZP</Col>
                      </Row>
                    </Modal>
                    <Row>
                      <Col span={9}>
                        <div>
                          <Card
                            title={'分类：' + iter.catename}
                            bordered={false}
                            style={{ width: '80%' }}
                          >
                            <p>{'详细信息：' + iter.memo}</p>
                            <p>{'创建者：' + iter.createname}</p>
                            <p>{'求助帖数目：' + iter.articlenum}</p>
                            <p>{'有效审核者：' + iter.auditornum + ' 位'}</p>

                            <p>{'当前收益：' + iter.reword / 10000.0 + ' MZP'}</p>
                            <p>{'当前得票：' + iter.votetick / 10000.0 + ' MZP'}</p>
                            <p>{'最小支付金额：' + iter.paylimit / 10000.0 + ' MZP'}</p>

                            <p>{'优质评论奖励：' + iter.comratio + '%'}</p>
                            <p>{'投票者奖励：' + iter.voteratio + '%'}</p>
                            <p>{'审核者奖励：' + iter.audiratio + '%'}</p>
                            <p>{'开发资金奖励：' + iter.devratio + '%'}</p>
                            <Row>
                              <Col span={12}>
                                <Button
                                  type="primary"
                                  onClick={ev => {
                                    this.regaudit(ev, iter.catename);
                                  }}
                                  ghost
                                >
                                  申请审核者
                                </Button>
                              </Col>
                              <Col span={12}>
                                <Button
                                  type="primary"
                                  onClick={ev => {
                                    this.logoutaudit(ev, iter.catename);
                                  }}
                                  ghost
                                >
                                  退出审核者
                                </Button>
                              </Col>
                            </Row>
                          </Card>
                        </div>
                      </Col>
                      <Col span={15}>
                        <h3>审核者列表(红色为当前有效审核者)</h3>
                        <List
                          dataSource={this.state.audlist[i - 1]}
                          renderItem={item => (
                            <List.Item
                              actions={[
                                <Button
                                  type="primary"
                                  onClick={ev => {
                                    this.showVoteModal(ev, item.auditor, iter.catename);
                                  }}
                                >
                                  投票
                                </Button>,
                              ]}
                            >
                              <List.Item.Meta
                                description={
                                  <div>
                                    <Row>
                                      <Col span={10}>
                                        <font
                                          color={
                                            this.contains(iter.catename, item.auditor) <
                                            iter.auditornum
                                              ? 'red'
                                              : ''
                                          }
                                        >
                                          {'账号：' + item.auditor}
                                        </font>
                                      </Col>
                                      <Col span={10}>
                                        <font
                                          color={
                                            this.contains(iter.catename, item.auditor) <
                                            iter.auditornum
                                              ? 'red'
                                              : ''
                                          }
                                        >
                                          {'得票数：' + item.amount / 10000.0 + ' MZP'}
                                        </font>
                                      </Col>
                                    </Row>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        )}
      </div>
    );
  }
}
export default Sr;
