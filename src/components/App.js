import { hot } from 'react-hot-loader/root';
import React from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';

const App = () => {
  return(
    <>
      <Header />
      <Main />
      <Footer />
    </>
  )
}

export default hot(App);
