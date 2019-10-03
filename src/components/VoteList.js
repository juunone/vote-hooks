import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as types from '../actions/ActionTypes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faVoteYea } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert';
import loadable from '@loadable/component';
const Title = loadable(() => import(/* webpackChunkName: "Title" */'./common/Title'))
const Section = loadable(() => import(/* webpackChunkName: "Section" */'./common/Section'))
const Card = loadable(() => import(/* webpackChunkName: "Card" */'./common/Card'))
const Modal = loadable(() => import(/* webpackChunkName: "Modal" */'./common/Modal'))



class VoteList extends Component{
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this._fetchData();
  }

  _fetchData() {
    this.props._handleFetchData();
  }

  _handleDelete = (onClose, data) => {
    this.props._handleFetchData('DELETE', data);
    onClose();
  }

  _handleSave = (onClose, data, path) => {
    this.props._handleFetchData('PUT', data, path);
    onClose();
  }

  _settingVote = (type, data) => {    
    return( 
      confirmAlert({
        closeOnEscape: true,
        closeOnClickOutside: false,
        customUI: ({ onClose }) => {              
          return (
            <Modal 
              type={type}
              data={data}
              onClose={onClose} 
              handleSave={this._handleSave} 
              handleDelete={this._handleDelete} 
            />
          )
        }      
      })
    )
  }

  _voting = (type, data) => {
    return( 
      confirmAlert({
        closeOnEscape: true,
        closeOnClickOutside: false,
        customUI: ({ onClose }) => {              
          return (
            <Modal 
              type={type}
              data={data}
              onClose={onClose} 
              handleSave={this._handleSave} 
              handleDelete={this._handleDelete} 
            />
          )
        }      
      })
    )
  }

  _resultVote = (type, data) => {
    return( 
      confirmAlert({
        closeOnEscape: true,
        closeOnClickOutside: true,
        customUI: ({ onClose }) => {              
          return (
            <Modal 
              type={type}
              data={data}
              onClose={onClose} 
              handleDelete={this._handleDelete} 
            />
          )
        }      
      })
    )
  }

  _renderData(data, type) {
    const mappingData = data.map((v,i) => {
      return (
        <div key={i} className={'container__card'}>
          <Card data={data[i]} type={type} settingVote={this._settingVote} voting={this._voting} resultVote={this._resultVote} />
        </div>
      )
    });

    return mappingData;
  }

  render(){
    const {standingData, onGoingData, closedData, error , loading} = this.props;
    if (error) {
      return <div className={'no-data'}>&#x1F6A8;네트워크 에러<br/><br/>로컬 환경에서 접속해주세요.</div>;
    }

    if (loading) {
      return <div className={'no-data'}>Loading <FontAwesomeIcon icon={faSpinner} spin={true} /></div>;
    }
    
    if(standingData.length || onGoingData.length || closedData.length) {
      return(
        <Section className={'container__section'}>        
          {!!standingData.length && (
            <div className={"container__row vote__row--standing"}>
              <Title key='title' className="container__title">&#129304; 대기중인 투표</Title>
              {this._renderData(standingData, 'standing')}
            </div>
          )}
          {!!onGoingData.length && (
            <div className={"container__row vote__row--ongoing"}>
              <Title key='title' className="container__title">&#x1F525; 진행중인 투표</Title>
              {this._renderData(onGoingData, 'ongoing')}
            </div>
          )}
          {!!closedData.length && (
            <div className={"container__row vote__row--closed"}>
              <Title key='title' className="container__title">&#x2705; 종료된 투표</Title>
              {this._renderData(closedData, 'closed')}
            </div>
          )}
        </Section>
      )
    } else {
      return(
        <div className={'no-data'}>
          <FontAwesomeIcon icon={faVoteYea} size={"2x"} color={"#0072ff"} />
          <h3><b style={{color:'#0072ff'}}>선한 영향력</b><br />투표를 만들어주세요&#129304;</h3>
        </div>
      )
    }
  }
}

VoteList.propTypes = {
  standingData: PropTypes.array,
  onGoingData: PropTypes.array,  
  closedData: PropTypes.array,  
  data: PropTypes.array,
  error: PropTypes.string,
  loading: PropTypes.bool,
  _handleFetchData: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
  _handleFetchData: (method, data) => { dispatch({type: types.FETCH_DATA_START, payload: {method, data}}) },
})

const mapStateToProps = state => ({
  closedData: state.reducer.closedData,
  data: state.reducer.data,
  error: state.reducer.error,
  loading: state.reducer.loading,
  onGoingData: state.reducer.onGoingData,
  standingData: state.reducer.standingData
})

export default connect(mapStateToProps, mapDispatchToProps)(VoteList);
  