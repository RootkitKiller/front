import React, { Component } from 'react';
//import { Button } from 'antd';
import { get } from '../tools/ipfsapi';

class Details extends Component {
  render() {
    const match = this.props.match.params;
    var arthash = match.arthash;
    var details = '';
    get(arthash)
      .then(data => {
        details = data;
        //console.log(details);
      })
      .catch(err => {
        console.log(err);
      });

    return (
      <div>
        {' '}
        <img src={details} />
      </div>
    );
  }
}
export default Details;
