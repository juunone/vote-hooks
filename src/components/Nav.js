import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as types from '../actions/ActionTypes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert';
import loadable from '@loadable/component';
const Button = loadable(() => import(/* webpackChunkName: "Button" */'./common/Button'))
const Modal = loadable(() => import(/* webpackChunkName: "Modal" */'./common/ModalHook'))

const Nav = (props) => {
  const handleSave = (onClose, data) => {
    props._handleFetchData('POST', data);
    onClose();
  }

  const createVote = useCallback((type) => {
    return(
      confirmAlert({
        closeOnEscape: true,
        closeOnClickOutside: false,
        customUI: ({ onClose }) => {
          return (
            <Modal 
              data={{}}
              type={type}
              onClose={onClose} 
              handleSave={handleSave}
            />
          )
        }      
      })
    )
  }, [])

  return(      
    <nav>
      <Button onClick={()=>{createVote('create')}} className='nav__button'>
        <FontAwesomeIcon icon={faPlus} /> Create Vote
      </Button>
    </nav>
  )
}

const mapDispatchToProps = dispatch => ({
  _handleFetchData: (method, data) => { dispatch({type: types.FETCH_DATA_START, payload: {method,data}}) },
})

Nav.propTypes = {
  _handleFetchData: PropTypes.func.isRequired,
  onClose: PropTypes.func,
}

export default connect(null, mapDispatchToProps)(Nav);