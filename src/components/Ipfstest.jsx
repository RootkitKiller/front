import React, { Component } from 'react';
import { Button } from 'antd';
import { add, get } from '../tools/ipfsapi';

class Ipfstest extends Component {
  uploadbuffer() {
    let str = 'test data! test data! test data! test data!';
    let buffer = Buffer.from(str);

    add(buffer)
      .then(hash => {
        console.log(hash);
      })
      .catch(err => {
        console.log(err);
      });
  }
  getbuffer() {
    get('QmUeotPP86zMWnzF7bhDp8VaQtA9kjdZpGbr2hVnSjGxqB')
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <div>
        <p>Ipfstest</p>
        <Button onClick={this.uploadbuffer}>上传buffer测试</Button>
        默认上传"test data！"字符串
        <br />
        <Button onClick={this.getbuffer}>获取buffer测试</Button>
        <br />
        本地显示图片：示例：http://119.28.52.50:8080/ipfs/QmUeotPP86zMWnzF7bhDp8VaQtA9kjdZpGbr2hVnSjGxqB
        <img
          height="200"
          src="http://119.28.52.50:8080/ipfs/QmUeotPP86zMWnzF7bhDp8VaQtA9kjdZpGbr2hVnSjGxqB"
        />
        <br />
      </div>
    );
  }
}
export default Ipfstest;
