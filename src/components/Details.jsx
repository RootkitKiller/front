import React, { Component } from 'react';

import { Spin, Icon } from 'antd';

import { get } from '../tools/ipfsapi';



  var details = '';
  var title = '';
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
    
class Details extends Component {
    constructor(props){
    super(props);
    this.state = {
      loading: true,
    }
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
        this.setState({
          loading: false
        })
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
          :<div><p style={{textAlign : 'center'}}><h1 >{title}</h1></p>
            <span dangerouslySetInnerHTML={{__html: details}} /></div>
        }

      </div>
      
    );
  }
}
export default Details;
