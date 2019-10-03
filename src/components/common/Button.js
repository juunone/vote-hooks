import React from 'react';
import PropTypes from 'prop-types';

const Button = (props) => {
  const {className, ...others} = props;
  return(
    <button className={className} {...others} />
  ) 
}

export default Button;

Button.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};