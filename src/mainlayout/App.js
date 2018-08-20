import React ,{ Component } from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';

import Home from '../components/Home';
import Article from '../components/Article';
import Wallet from '../components/Wallet';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";

// const history = createHistory()

const { Header, Content, Footer } = Layout;
class App extends Component {
  render(){
    return (
      <Router>
        <Layout>
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <div className="logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1"><Link to='home'>主页</Link></Menu.Item>
              <Menu.Item key="2"><Link to='article'>文章</Link></Menu.Item>
              <Menu.Item key="3"><Link to='sr'>订阅</Link></Menu.Item>
              <Menu.Item key="4"><Link to='wallet'>钱包</Link></Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px', marginTop: 64 }}>
            {/* <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> */}
            <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
              <Route exact path="/home" component={Home} />
              <Route path="/article" component={Article} />
              <Route path="/wallet" component={Wallet} />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Router>
      );
  }
}
export default App;