import React, {useState, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPoll } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
const Line = loadable(() => import('./Line'))

const calcPercent = props => {    
  const { type, data } = props;
  let inTime = 0;
  if(type === 'ongoing'){
    const total = (data.endedAt - data.startedAt);
    const pastTime = (+ new Date - data.startedAt);
    inTime = pastTime / total * 100
  }else if(type === 'closed'){
    inTime = 100;
  }
  
  return Math.floor(inTime);
}

const Card = (props) => {
  const avg = useMemo(() => calcPercent(props), [percent])

  const [percent, setPercent] = useState(props.type !== 'ongoing' ? (props.type === 'standing' ? 0 : 100 ) : calcPercent(props));
  const [delay] = useState(1000);


  useEffect(() => {
    const interval = setInterval(() => frame(), delay);
    return () => {
      clearInterval(interval); 
    }
  });

  const frame = () => {
    if (percent < 100){
      setPercent(avg);
    }
  }

  const makeHtml = (data, type, settingVote, voting, resultVote) => {
    if(data){  
      const endAt = moment(data.endedAt).format("lll");
      return (
        <> 
          <div className={'container__background'}></div>
          <div className={'container__symbol'}>
            <FontAwesomeIcon icon={faPoll} color={'#f99ea8'} />
          </div>
          <h3 className={'container__card__title'}>{data.title}</h3>
          {type === 'standing' && <Button className='container__card__button' onClick={()=>{settingVote('setting', data)}}>수정/삭제</Button>} 
          {type === 'ongoing' && <Button className='container__card__button' onClick={()=>{voting('ongoing', data)}}>투표</Button>} 
          {type === 'closed' && <Button className='container__card__button' onClick={()=>{resultVote('result', data)}}>결과보기</Button>}
          <div className={'container__card__footer'}>
            <Line className={'progress red'} percent={percent} />
            <p className={'container__card__author'}>{data.author} / {endAt}</p>
          </div>
        </>
      )
    }else{
      return null;
    }
  }

  const { data, type, settingVote, voting, resultVote } = props;
  return(
    makeHtml(data, type, settingVote, voting, resultVote)
  )
};

export default Card;

Card.propTypes = {
  type: PropTypes.string, 
  data: PropTypes.object,
  settingVote: PropTypes.func,
  endedAt: PropTypes.number,
  voting: PropTypes.func,
  resultVote: PropTypes.func
};