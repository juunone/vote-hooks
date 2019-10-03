import React from 'react';
import PropTypes from 'prop-types';

const Line = (props) => {
  const {className, percent} = props;

  return(
    <div className={className}>
      <span className={percent !== 100 ? 'animate' : ''} style={{width:`${percent}%`}}></span>
    </div>
  )
};

export default Line;

Line.propTypes = {
  className: PropTypes.string,
  percent:PropTypes.number
};