import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'

export default class Footer extends Component{
  render(){
    return(
      <footer><p><a style={{fontWeight:'600'}} href="https://github.com/juunone/react-vote" target="_blank" rel="noopener noreferrer">VOTE</a> was made with <FontAwesomeIcon icon={faHeart} color="red" />  by <a href="https://github.com/juunone" target="_blank" rel="noopener noreferrer">Juunone</a></p></footer>
    )
  }
}