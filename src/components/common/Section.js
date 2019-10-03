import React from 'react';
import PropTypes from 'prop-types';

const Section = (props) => {
  const { className, ...others } = props;
  return <section className={className} {...others} />;
};

export default Section;

Section.propTypes = {
  className: PropTypes.string,
  others:PropTypes.any
};