import React ,  {Component} from 'react';


import { Collapse } from 'antd';

import { List, Avatar, Button, Spin, Icon } from 'antd';

import { getRows } from '../request/request.js';

//const fakeDataUrl = 'https://randomuser.me/api/?results=5&inc=name,gender,email,nat&noinfo';

const Panel = Collapse.Panel;

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden'
};

var listCates = [];
var listArticles = [];
var i = 0;

getRows(true, 'wafyartvotes', 'wafyartvotes', 'cates')
  .then(data => {
    listCates = data.rows;
    console.log(listCates);
    for (let i = 0; i < listCates.length; i++) {
      getRows(true, 'wafyartvotes', listCates[i].catename, 'articles')
        .then(data => {
          listArticles[i] = data.rows;
          console.log(listArticles);
        })
        .catch(err => {
          console.log(err);
        });
    }
  })
  .catch(err => {
    console.log(err);
  });

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

class Article extends React.Component {
  render() {
    i = 0;
    return (
      <Collapse bordered={false} defaultActiveKey={['1']} accordion>
        {listCates.map(iter => {
          i = i + 1;
          return (
            <Panel header={iter.catename} key={i} style={customPanelStyle}>
              <List
                itemLayout="vertical"
                size="large"
                pagination={{
                  onChange: page => {
                    console.log(page);
                  },
                  pageSize: 3
                }}
                dataSource={listArticles[i - 1]}
                renderItem={item => (
                  <List.Item
                    key={item.title}
                    actions={[
                      <IconText type="like" text={item.addtick} />,
                      <IconText type="pay-circle" text={item.basetick} />,
                      <IconText type="user" text={item.author} />,
                      <IconText
                        type="usr"
                        text={new Date(
                          item.timestamp * 1000
                        ).toLocaleDateString()}
                      />
                    ]}
                    //extra={<img width={272} alt="logo" src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png" />}
                  >
                    <List.Item.Meta
                      //avatar={<Avatar src={item.avatar} />}
                      title={
                        <a href={String('/article/' + item.arthash)}>
                          {item.title}
                        </a>
                      }
                      description={item.abstract}
                    />
                    {item.content}
                  </List.Item>
                )}
              />
            </Panel>
          );
        })}
      </Collapse>
    );
  }
}
export default Article;
