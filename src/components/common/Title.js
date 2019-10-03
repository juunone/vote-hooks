import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Title extends Component{
  constructor(props){
    super(props);        
  }

  render(){
    const { className, ...others } = this.props;
    return <h3 className={className} {...others} />
  }
}

Title.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};