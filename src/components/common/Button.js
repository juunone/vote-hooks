import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Button extends Component{
  constructor(props){
    super(props);        
  }

  render(){
    const {className, ...others} = this.props;
    return <button className={className} {...others} />
  }
}

Button.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};