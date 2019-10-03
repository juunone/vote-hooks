import React from 'react';
import PropTypes from 'prop-types';

const FormErrors = ({formErrors}) => {
  return (
    <div className='form-errors'>
      <p>{formErrors}</p>
    </div>
  )
};

FormErrors.propTypes = {
  formErrors: PropTypes.string, 
};

export default FormErrors;