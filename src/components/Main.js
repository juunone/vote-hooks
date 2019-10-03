import React, { Component } from 'react';
import VoteList from './VoteList';

export default class Main extends Component{
  render(){
    return(
      <main>
        <div className={'container'}>
          <VoteList />
        </div>
      </main>
    )
  }
}