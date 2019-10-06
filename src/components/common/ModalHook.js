import React, { useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component'
import DatePicker from "react-datepicker";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUser, faCheck, faVoteYea, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import Button from './Button';
const FormErrors = loadable(() => import('./FormErrors'))

const Modal = (props) => {
  const copyData = JSON.parse(JSON.stringify(props.data));
  const isExistData = Object.keys(copyData).length;

  function reducer(state, action){
    return{
      ...state,
      ...action
    }
  }

  const calculateMinTime = date => {
    let isToday = moment(date).isSame(moment(), 'day');
    if (isToday) {
      let nowAddOneHour = moment(new Date()).add({minutes: 10}).toDate();
      return nowAddOneHour;
    }
    return moment().startOf('day').toDate();
  }

  const [state, dispatch] = useReducer(reducer, {
    categoryLimit: 6,
    voteCnt: isExistData ? Object.keys(copyData.contents).length : 3,
    startedAt: isExistData ? copyData.startedAt : moment(new Date()).add({minutes: 30}).toDate(),
    endedAt: isExistData ? copyData.endedAt : moment(new Date()).add({hours: 1}).toDate(),
    minTime: calculateMinTime(new Date()),
    title: isExistData ? copyData.title : "",
    author: isExistData && props.type !== 'ongoing' ? copyData.author : "",
    password:"",
    contents: isExistData ? copyData.contents : {},
    titleValid: isExistData ? true : false,
    authorValid: isExistData && props.type !== 'ongoing' ? true : false,
    passwordValid: props.type !== 'ongoing' ? false : true,
    contentsValid: isExistData ? true : false,
    startedAtValid: true,
    endedAtValid: true,
    formValid: false,
    votingValid: props.type !== 'ongoing' ? true : false,
    formErrors: {title:'', author: '', password:'', contents:'', contentsObj: isExistData ? copyData.contents : {}, startedAt:'', endedAt: ''}
  });

  const _delete = useCallback(onClose => {
    const { handleDelete, data } = props;
    const { password } = state;

    const id = {
      id: props.data && props.data.id
    }

    if(data.password === password){
      if(confirm('정말 삭제하시겠습니까?')){
        handleDelete(onClose, id);
      }
    } 
    else return alert('비밀번호가 일치하지 않습니다.');
  }, []);

  const poll = useCallback(onClose => {
    let newState = {...state.contents};
    if(state.author !== '' && state.authorValid !== false){
      if(!newState[state.selectedCategory].voter.includes(state.author)){
        const getOriginData = JSON.parse(JSON.stringify(state.formErrors.contentsObj));
        newState = getOriginData;
        newState[state.selectedCategory].voter.push(state.author);
      }
    }else{
      return alert('투표자 성함을 입력해주세요.');
    }
    
    const { handleSave } = props;
    const data = {
      id: props.data && props.data.id,
      contents: newState,
    };

    handleSave(onClose, data, 'poll/');
  }, []);

  const save = useCallback(onClose => {
    const { type, handleSave } = props;
    const { title, author, password, contents, startedAt, endedAt } = state;
    const data = {
      id: props.data && props.data.id,
      title:title,
      author:author,
      password:password,
      contents:contents,
      startedAt: typeof startedAt !== 'number' ? startedAt.getTime() : startedAt,
      endedAt: typeof endedAt !== 'number' ? endedAt.getTime() : endedAt
    };

    if(type === 'create' && state.formValid === true){
      handleSave(onClose, data);
    } else if(props.data.password === password && state.formValid === true) {
      handleSave(onClose, data);
    }else{
      return alert('비밀번호가 일치하지 않습니다.');
    }
  }, []);

  const handleStartedDateChange = date => {
    dispatch({
      startedAt:date,
      endedAt:moment(date).add({hours: 1}).toDate(),
      minTime: calculateMinTime(date),
    }, () => { validateField('startedAt', date) })
  }

  const handleEndedDateChange = date => {
    dispatch({
      endedAt:date,
      minTime: calculateMinTime(date),
    }, () => { validateField('endedAt', date) })
  }
  
  const handleUserInput = (e, type, i) => {
    const name = e.target && e.target.name;
    const value = e.target ? e.target.value : e;
    const contents = {...state.contents};

    switch(type){
    case 'voteContents':
      if(!contents[`category-${i}`]) contents[`category-${i}`] = {};
      contents[`category-${i}`].value = e.target.value;
      contents[`category-${i}`].voter = [];

      dispatch({
        contents
      });
      validateField('contents', value, i);
      break;
    case 'voting':
      dispatch({
        [name]: value,
        contents: JSON.parse(JSON.stringify(state.formErrors.contentsObj))
      });
      validateField(name, value);
      break;
    case 'delete':
      dispatch({
        contents
      });
      validateField('delete', value, i)
      break;
    default:
      dispatch({
        [name]: value
      });
      validateField(name, value)
      break;
    }
  }

  const validateField = (fieldName, value, index) => {
    let fieldValidationErrors = state.formErrors;
    let titleValid = state.titleValid;
    let authorValid = state.authorValid;
    let passwordValid = state.passwordValid;
    let contentsValid = state.contentsValid;
    let startedAtValid = state.startedAtValid;
    let endedAtValid = state.endedAtValid;
    let selectedCategory = state.selectedCategory;
    const titleReg = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|\w |*]+$/;
    const authorReg = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|*]+$/;
    const passwordReg = /^[a-z|A-Z|0-9|*]+$/;
  
    switch(fieldName) {
    case 'title':
      titleValid = titleReg.test(value);
      fieldValidationErrors.title = titleValid ? '' : '특수문자를 제외한 한글,영문,숫자만 입력 가능합니다.';
      break;
    case 'author':
      authorValid = authorReg.test(value);
      selectedCategory = authorReg.test(value) === true && '';
      fieldValidationErrors.author = authorValid ? '': '특수문자 및 숫자를 제외한 한글,영문만 입력 가능합니다.';
      break;
    case 'password':
      passwordValid = passwordReg.test(value);
      fieldValidationErrors.password = passwordValid ? '': '특수문자를 제외한 영문,숫자만 입력 가능합니다.';
      break;
    case 'delete':
      if(value !== ''){
        if(contentsValid !== false) contentsValid =  true;
      }else{
        contentsValid =  true;
      }
      
      fieldValidationErrors.contents = contentsValid ? '': '항목을 모두 입력해주세요.';
      break;
    case 'contents':
      contentsValid =  true;
      if(!fieldValidationErrors.contentsObj[`category-${index}`]) fieldValidationErrors.contentsObj[`category-${index}`] = {};
      fieldValidationErrors.contentsObj[`category-${index}`].value = value;
      fieldValidationErrors.contentsObj[`category-${index}`].voter = [];
      Object.keys(fieldValidationErrors.contentsObj).forEach((v)=>{
        if(state.voteCnt !== Object.keys(fieldValidationErrors.contentsObj).length){
          contentsValid = false;
        }else if(fieldValidationErrors.contentsObj[v].value === ""){          
          contentsValid = false;
        }
      });
      fieldValidationErrors.contents = contentsValid ? '': '항목을 모두 입력해주세요.';
      break;
    case 'startedAt':
      startedAtValid = value !== null;
      fieldValidationErrors.startedAt = startedAtValid ? '': '시작일을 선택해주세요.';
      break;
    case 'endedAt':
      endedAtValid = value !== null;
      fieldValidationErrors.endedAt = endedAtValid ? '': '종료일을 선택해주세요.';
      break;
    default:
      break;
    }

    dispatch({
      formErrors: fieldValidationErrors,
      titleValid: titleValid,
      authorValid: authorValid,
      passwordValid: passwordValid,
      contentsValid: contentsValid,
      startedAtValid: startedAtValid,
      endedAtValid: endedAtValid,
      selectedCategory: selectedCategory
    });
    validateForm();
  }

  const validateForm = () => {
    let contentsValid = true;
    let fieldValidationErrors = state.formErrors;
    if(Object.keys(fieldValidationErrors.contentsObj).length){
      Object.keys(fieldValidationErrors.contentsObj).forEach((v)=>{
        if(state.voteCnt !== Object.keys(fieldValidationErrors.contentsObj).length){
          contentsValid = false;
        }else if(fieldValidationErrors.contentsObj[v].value === ""){
          contentsValid = false;
        }
      });
    }else{
      contentsValid = false;
    }

    dispatch({
      formValid : 
        state.titleValid && 
        state.authorValid &&
        state.passwordValid &&
        contentsValid &&
        state.startedAtValid &&
        state.endedAtValid
    });
  }

  const deleteContents = (value, i) => {
    const contents = {...state.contents};
    const formErrors = {...state.formErrors};
    const voteCnt = state.voteCnt;
    let newContents = {};
    
    delete contents[`category-${i+1}`];
    const makeNewContents = Object.keys(contents).forEach((key,index) => {
      newContents[`category-${index+1}`] = {
        value:contents[key].value,
        voter:contents[key].voter,
      }
    });

    formErrors.contentsObj = newContents;

    dispatch({
      contents: newContents,
      voteCnt: voteCnt - 1,
      formErrors
    });
    handleUserInput(value, 'delete', i);
  }

  const makeVoteContent = (cnt) => {
    let arr = [];
    for(let i = 0; i < cnt; i++){
      if(i > 2){
        arr.push(
          <div key={i} className={'remove__contentsWrap'}>
            <i onClick={()=>{deleteContents(state.contents[`category-${i+1}`] ? state.contents[`category-${i+1}`].value : '', i)}}>
              <FontAwesomeIcon icon={faTimesCircle} size={'1x'} /> 
            </i>
            <input
              type="text" 
              className={`form-group__${errorLog(state.formErrors.contents)}`} 
              name="contents" 
              placeholder="항목 입력" 
              maxLength="10" 
              autoComplete="off"
              value={state.contents[`category-${i+1}`] ? state.contents[`category-${i+1}`].value : ''} 
              onChange={(event) => handleUserInput(event,'voteContents', i+1)} 
            />
          </div>
        );
      }else{
        arr.push(
          <input key={i} 
            type="text" 
            className={`form-group__${errorLog(state.formErrors.contents)}`} 
            name="contents" 
            placeholder="항목 입력" 
            maxLength="10" 
            autoComplete="off"
            value={state.contents[`category-${i+1}`] ? state.contents[`category-${i+1}`].value : ''} 
            onChange={(event) => handleUserInput(event,'voteContents', i+1)} 
          />
        );
      }
    }
    return arr;
  }

  const makeResults = () => {
    const { type, data } = props;
    const contents = {...state.contents};

    const categoryResult = () => {
      return Object.keys(contents).map((v)=>{
        const leng = contents[v].voter.length;
        const voterList = contents[v].voter.join(', ');
        return( 
          <div key={v} className={leng === data.topAcquisitionVote ? 'categories top' : 'categories'}>
            <div className={'categories__contents clearfix'}>
              <p className={'value'}>
                {leng === data.topAcquisitionVote && <FontAwesomeIcon icon={faCheck} size={'xs'} /> }
                <b>{contents[v].value}</b>
              </p>
              <p className={'voter'}>
                <FontAwesomeIcon icon={faVoteYea} size={'xs'} /> 
                <b>{leng}</b>
              </p>
            </div>
            {leng !== 0 && (
              <p className={'voter__list'}>
                <FontAwesomeIcon icon={faUser} size={'xs'} /> : {voterList}
              </p>
            )}
          </div>
        )
      });
    };

    const voting = () => {
      return Object.keys(contents).map((v)=>{
        const leng = contents[v].voter.length;
        return( 
          <div key={v} className={contents[v].voter.includes(state.author) ? 'categories top' : 'categories'}>
            <div className={'categories__contents clearfix pointer'} onClick={()=>{clickVote(v)}}>
              <p className={'value'}>
                <b>{contents[v].value}</b>
              </p>
              <p className={'voter'}>
                <FontAwesomeIcon icon={faVoteYea} size={'xs'} /> 
                <b>{leng}</b>
              </p>
            </div>
          </div>
        )
      });
    };

    return(
      <div className={'container'}>
        <h2 className={'title'}>{data.title}</h2>
        <div className={'date'}>
          <p>시작: {moment(data.startedAt).format('lll')}</p>
          <p>종료: {moment(data.endedAt).format('lll')}</p>
        </div>
        {type === 'ongoing' && voting()}
        {type === 'ongoing' && (
          <label className={'label__alone'}>
            <input 
              type="text" 
              className={`result__input form-group__${errorLog(state.formErrors.author)}`} 
              autoComplete='off' 
              id="author" 
              name="author" 
              placeholder="투표자 성함을 입력해주세요"               
              maxLength="10" 
              disabled={type === 'create' || type === 'ongoing' ? false : true}
              value={state.author} 
              onChange={(event) => handleUserInput(event, 'voting')}
            />
            <FormErrors formErrors={state.formErrors.author} />
          </label>
        )}
        {type === 'result' && categoryResult()}
        {type === 'result' && (
          <label className={'label__alone'}>
            <input 
              type="password" 
              className={`result__input form-group__${errorLog(state.formErrors.password)}`} 
              autoComplete='off' 
              maxLength="20"
              id="password"  
              name="password" 
              placeholder="비밀번호" 
              value={state.password} 
              onChange={(event) => handleUserInput(event)} 
            />
          </label>
        )}
      </div>
    )
  }

  const clickVote = (category) => {
    if(state.author !== '' && state.authorValid !== false){
      let newState = {...state.contents};
      const getOriginData = JSON.parse(JSON.stringify(state.formErrors.contentsObj));

      let exludeObj = {};

      const mappingExcludeAuthor = Object.keys(getOriginData).forEach(v => {
        if(getOriginData[v].voter.includes(state.author)){
          exludeObj = {
            category: v,
            value: getOriginData[v].value,
            voter: getOriginData[v].voter
          }
        }
      });

      if(Object.keys(exludeObj).length){ //동일한 투표자 중복투표시
        const excludeAuthor = exludeObj.voter.findIndex(value => {
          return value === state.author;
        });
        exludeObj.voter.splice(excludeAuthor, 1);
  
        getOriginData[exludeObj.category] = {
          value:exludeObj.value,
          voter:exludeObj.voter
        }
      }
      
      newState = {...getOriginData};
      newState[category].voter.push(state.author);

      dispatch({
        contents:newState,
        selectedCategory:category,
        votingValid : true
      });
    }else{
      return alert('투표자 성함을 입력해주세요.');
    }
  }

  const errorLog = (error) => {
    return(error.length === 0 ? '' : 'has-error');
  }

  const addContent = () => {
    const newCnt = state.voteCnt;
    if(newCnt >= state.categoryLimit){
      return;
    } else {
      dispatch({
        voteCnt: newCnt + 1
      });
    }    
  }

  const {type, onClose} = props;
  return(      
    <div className={'modal'}>
      {type === 'create' || type === 'setting' ? (
        <div className={'modal__main'}>
          <label className={'label__alone'}>
            <input 
              type="text" 
              className={`form-group__${errorLog(state.formErrors.title)}`} 
              autoComplete='off' 
              id="title" 
              name="title" 
              placeholder="제목" 
              maxLength="15" 
              value={state.title} 
              onChange={(event) => handleUserInput(event)} 
            />
            <FormErrors formErrors={state.formErrors.title} />
          </label>
          <label className={'label__alone'}>
            <input 
              type="text" 
              className={`form-group__${errorLog(state.formErrors.author)}`} 
              autoComplete='off' 
              id="author" 
              name="author" 
              placeholder="작성자"               
              maxLength="10" 
              disabled={type === 'create' ? false : true}
              value={state.author} 
              onChange={(event) => handleUserInput(event)}
            />
            <FormErrors formErrors={state.formErrors.author} />
          </label>
          <label className={'label__alone'}>
            <input 
              type="password" 
              className={`form-group__${errorLog(state.formErrors.password)}`} 
              autoComplete='off' 
              maxLength="20" 
              id="password" 
              name="password" 
              placeholder="비밀번호" 
              value={state.password} 
              onChange={(event) => handleUserInput(event)} 
            />
            <FormErrors formErrors={state.formErrors.password} />
          </label>
          <label className={'label__text'}>
            {makeVoteContent(state.voteCnt)}
            <FormErrors formErrors={state.formErrors.contents} />
          </label>
          <label className={'label__button'} style={{display: state.voteCnt >= state.categoryLimit ? 'none' : 'block'}}>
            <Button className={'add__button'} onClick={(()=>{addContent()})}>
              <FontAwesomeIcon icon={faPlus} /> 항목 추가
            </Button>
          </label>
          <div className={'modal_datepicker clearfix'}>
            <div className={'datepicker__title'}>시작</div>
            <DatePicker
              mode="time"
              selected={state.startedAt}
              className={`form-group__${errorLog(state.formErrors.startedAt)}`} 
              showTimeSelect
              dateFormat="yyyy.MM.dd HH:mm"
              onChange={handleStartedDateChange}
              timeIntervals={10}
              minDate={moment().toDate()}
              minTime={state.minTime}
              maxTime={moment().endOf('day').toDate()}
            />                
            <FormErrors formErrors={state.formErrors.startedAt} />
          </div>
          <div className={'modal_datepicker clearfix'}>
            <div className={'datepicker__title'}>종료</div>
            <DatePicker
              selected={state.endedAt}
              className={`form-group__${errorLog(state.formErrors.endedAt)}`} 
              showTimeSelect
              dateFormat="yyyy.MM.dd HH:mm"
              onChange={handleEndedDateChange}
              timeIntervals={10}
              minDate={moment().toDate()}
              minTime={moment(state.minTime).add({hours: 1}).toDate()}
              maxTime={moment().endOf('day').toDate()}
            />
            <FormErrors formErrors={state.formErrors.endedAt} />
          </div>
        </div>
      ) : (type === "result" ? (
        <div className={'modal__results'}>
          {makeResults()}
        </div>
      ) : (
        <div className={'modal__results'}>
          {makeResults()}
        </div>
      )
      )}
      <div className={"modal__footer"}>
        <Button className={'default__button'} onClick={(()=>{onClose()})}>닫기</Button>
        {type !== 'result' && type !== "ongoing" ? <Button className={'nav__button'} onClick={(()=>{save(onClose)})} disabled={!state.formValid}>저장</Button> : null}
        {type === 'ongoing' && <Button className={'nav__button'} onClick={(()=>{poll(onClose)})} disabled={!state.formValid || !state.votingValid || state.selectedCategory === ""}>투표하기</Button>}
        {type === 'setting' || type === 'result' ? <Button className={'delete__button'} onClick={(()=>{_delete(onClose)})} disabled={!state.formValid}>삭제</Button> : null}
      </div>
    </div>
  )
};

export default Modal;

Modal.propTypes = {
  data: PropTypes.object, 
  type: PropTypes.string, 
  onClose: PropTypes.func, 
  handleSave: PropTypes.func,
  handleDelete: PropTypes.func
};