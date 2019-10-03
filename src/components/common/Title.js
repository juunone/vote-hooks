import React from 'react';
import PropTypes from 'prop-types';

const Title = (props) => {
  const { className, ...others } = props;
  return <h3 className={className} {...others} />;
};

export default Title;

Title.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};