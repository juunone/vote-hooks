import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';

class App extends Component{
  render(){
    return (
      <>
        <Header />
        <Main />
        <Footer />
      </>
    );
  }  
}

export default hot(App);
