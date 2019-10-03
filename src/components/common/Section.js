import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Section extends Component{
  constructor(props){
    super(props);        
  }

  render(){
    const { className, ...others } = this.props;
    return <section className={className} {...others} />
  }
}

Section.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};