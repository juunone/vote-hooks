import React from 'react';
import Nav from './Nav';
import Title from './common/Title';

const Header = () => {
  return(
    <header className={'clearfix'}>
      <div className={'container'}>
        <Title className="container__title">VOTE</Title>
      </div>
      <Nav />
    </header>
  )
};

export default Header;