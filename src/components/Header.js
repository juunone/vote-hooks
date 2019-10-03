import React, { Component } from 'react';
import Nav from './Nav';
import Title from './common/Title';

export default class Header extends Component{
  constructor(){
    super();
  }

  render(){
    return(
      <header className={'clearfix'}>
        <div className={'container'}>
          <Title className="container__title">VOTE</Title>
        </div>
        <Nav />
      </header>
    )
  }
}