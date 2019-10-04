import React, { useEffect, useCallback } from 'react';
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

const VoteList = (props) => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    props.handleFetchData();
  };

  const handleDelete = useCallback((onClose, data) => {
    props.handleFetchData('DELETE', data);
    onClose();
  });

  const handleSave = useCallback((onClose, data, path) => {
    props.handleFetchData('PUT', data, path);
    onClose();
  });

  const settingVote = useCallback((type, data) => {    
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
              handleSave={handleSave} 
              handleDelete={handleDelete} 
            />
          )
        }      
      })
    )
  }, [props.standingData])

  const voting = useCallback((type, data) => {
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
              handleSave={handleSave} 
              handleDelete={handleDelete} 
            />
          )
        }      
      })
    )
  }, [props.onGoingData])

  const resultVote = useCallback((type, data) => {
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
              handleDelete={handleDelete} 
            />
          )
        }      
      })
    )
  }, [props.closedData])

  const renderData = (data, type) => {
    console.log(data)
    const mappingData = data.map((v,i) => {
      return (
        <div key={i} className={'container__card'}>
          <Card data={data[i]} type={type} settingVote={settingVote} voting={voting} resultVote={resultVote} />
        </div>
      )
    });

    return mappingData;
  }
  
  const {standingData, onGoingData, closedData, error , loading} = props;
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
            {renderData(standingData, 'standing')}
          </div>
        )}
        {!!onGoingData.length && (
          <div className={"container__row vote__row--ongoing"}>
            <Title key='title' className="container__title">&#x1F525; 진행중인 투표</Title>
            {renderData(onGoingData, 'ongoing')}
          </div>
        )}
        {!!closedData.length && (
          <div className={"container__row vote__row--closed"}>
            <Title key='title' className="container__title">&#x2705; 종료된 투표</Title>
            {renderData(closedData, 'closed')}
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
};

VoteList.propTypes = {
  standingData: PropTypes.array,
  onGoingData: PropTypes.array,  
  closedData: PropTypes.array,  
  data: PropTypes.array,
  error: PropTypes.string,
  loading: PropTypes.bool,
  handleFetchData: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
  handleFetchData: (method, data) => { dispatch({type: types.FETCH_DATA_START, payload: {method, data}}) },
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
  