import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Line extends Component{
  constructor(props){
    super(props);        
  }

  render(){
    const {className, percent} = this.props;
    return (
      <div className={className}>
        <span className={percent !== 100 ? 'animate' : ''} style={{width:`${percent}%`}}></span>
      </div>
    )
  }
}

Line.propTypes = {
  className: PropTypes.string,
  percent:PropTypes.number
};