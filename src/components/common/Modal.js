import React, { Component } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component'
import DatePicker from "react-datepicker";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUser, faCheck, faVoteYea, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import Button from './Button';
const FormErrors = loadable(() => import('./FormErrors'))

export default class Modal extends Component{
  constructor(props){
    super(props);
    const copyData = JSON.parse(JSON.stringify(this.props.data));
    const isExistData = Object.keys(copyData).length;
    this.state = {
      categoryLimit: 6,
      voteCnt: isExistData ? Object.keys(copyData.contents).length : 3,
      startedAt: isExistData ? copyData.startedAt : moment(new Date()).add({minutes: 30}).toDate(),
      endedAt: isExistData ? copyData.endedAt : moment(new Date()).add({hours: 1}).toDate(),
      minTime: this._calculateMinTime(new Date()),
      title: isExistData ? copyData.title : "",
      author: isExistData && this.props.type !== 'ongoing' ? copyData.author : "",
      password:"",
      contents: isExistData ? copyData.contents : {},
      titleValid: isExistData ? true : false,
      authorValid: isExistData && this.props.type !== 'ongoing' ? true : false,
      passwordValid: this.props.type !== 'ongoing' ? false : true,
      contentsValid: isExistData ? true : false,
      startedAtValid: true,
      endedAtValid: true,
      formValid: false,
      votingValid: this.props.type !== 'ongoing' ? true : false,
      formErrors: {title:'', author: '', password:'', contents:'', contentsObj: isExistData ? copyData.contents : {}, startedAt:'', endedAt: ''}
    }
  }

  _delete = (onClose) => {
    const { handleDelete, data } = this.props;
    const { password } = this.state;

    const id = {
      id: this.props.data && this.props.data.id
    }

    if(data.password === password){
      if(confirm('정말 삭제하시겠습니까?')){
        handleDelete(onClose, id);
      }
    } 
    else return alert('비밀번호가 일치하지 않습니다.');
  };

  _poll = (onClose) => {
    let newState = {...this.state.contents};
    if(this.state.author !== '' && this.state.authorValid !== false){
      if(!newState[this.state.selectedCategory].voter.includes(this.state.author)){
        const getOriginData = JSON.parse(JSON.stringify(this.state.formErrors.contentsObj));
        newState = getOriginData;
        newState[this.state.selectedCategory].voter.push(this.state.author);
      }
    }else{
      return alert('투표자 성함을 입력해주세요.');
    }
    
    const { handleSave } = this.props;
    const data = {
      id: this.props.data && this.props.data.id,
      contents: newState,
    };

    handleSave(onClose, data, 'poll/');
  }

  _save = (onClose) => {
    const { type, handleSave } = this.props;
    const { title, author, password, contents, startedAt, endedAt } = this.state;
    const data = {
      id: this.props.data && this.props.data.id,
      title:title,
      author:author,
      password:password,
      contents:contents,
      startedAt: typeof startedAt !== 'number' ? startedAt.getTime() : startedAt,
      endedAt: typeof endedAt !== 'number' ? endedAt.getTime() : endedAt
    };

    if(type === 'create' && this.state.formValid === true){
      handleSave(onClose, data);
    } else if(this.props.data.password === password && this.state.formValid === true) {
      handleSave(onClose, data);
    }else{
      return alert('비밀번호가 일치하지 않습니다.');
    }
  }

  _calculateMinTime = date => {
    let isToday = moment(date).isSame(moment(), 'day');
    if (isToday) {
      let nowAddOneHour = moment(new Date()).add({minutes: 10}).toDate();
      return nowAddOneHour;
    }
    return moment().startOf('day').toDate();
  }

  _handleStartedDateChange = (date) => {
    this.setState({
      startedAt:date,
      endedAt:moment(date).add({hours: 1}).toDate(),
      minTime: this._calculateMinTime(date),
    }, () => {this._validateField('startedAt', date)} )
  }

  _handleEndedDateChange = (date) => {
    this.setState({
      endedAt:date,
      minTime: this._calculateMinTime(date),
    }, () => {this._validateField('endedAt', date)} )
  }
  
  _handleUserInput = (e, type, i) => {
    const name = e.target && e.target.name;
    const value = e.target ? e.target.value : e;
    const contents = {...this.state.contents};

    switch(type){
    case 'voteContents':
      if(!contents[`category-${i}`]) contents[`category-${i}`] = {};
      contents[`category-${i}`].value = e.target.value;
      contents[`category-${i}`].voter = [];

      this.setState({
        contents
      }, () => {this._validateField('contents', value, i)});
      break;
    case 'voting':
      this.setState({
        [name]: value,
        contents: JSON.parse(JSON.stringify(this.state.formErrors.contentsObj))
      }, () => {this._validateField(name, value)});
      break;
    case 'delete':
      this.setState({
        contents
      }, () => {this._validateField('delete', value, i)});
      break;
    default:
      this.setState({
        [name]: value
      }, () => {this._validateField(name, value)});
      break;
    }
  }

  _validateField(fieldName, value, index) {
    let fieldValidationErrors = this.state.formErrors;
    let titleValid = this.state.titleValid;
    let authorValid = this.state.authorValid;
    let passwordValid = this.state.passwordValid;
    let contentsValid = this.state.contentsValid;
    let startedAtValid = this.state.startedAtValid;
    let endedAtValid = this.state.endedAtValid;
    let selectedCategory = this.state.selectedCategory;
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
        if(this.state.voteCnt !== Object.keys(fieldValidationErrors.contentsObj).length){
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

    this.setState({
      formErrors: fieldValidationErrors,
      titleValid: titleValid,
      authorValid: authorValid,
      passwordValid: passwordValid,
      contentsValid: contentsValid,
      startedAtValid: startedAtValid,
      endedAtValid: endedAtValid,
      selectedCategory: selectedCategory
    }, this._validateForm);
  }
  
  _validateForm() {
    let contentsValid = true;
    let fieldValidationErrors = this.state.formErrors;
    if(Object.keys(fieldValidationErrors.contentsObj).length){
      Object.keys(fieldValidationErrors.contentsObj).forEach((v)=>{
        if(this.state.voteCnt !== Object.keys(fieldValidationErrors.contentsObj).length){
          contentsValid = false;
        }else if(fieldValidationErrors.contentsObj[v].value === ""){
          contentsValid = false;
        }
      });
    }else{
      contentsValid = false;
    }

    this.setState({
      formValid : 
        this.state.titleValid && 
        this.state.authorValid &&
        this.state.passwordValid &&
        contentsValid &&
        this.state.startedAtValid &&
        this.state.endedAtValid
    });
  }

  _deleteContents(value, i) {
    const contents = {...this.state.contents};
    const formErrors = {...this.state.formErrors};
    const voteCnt = this.state.voteCnt;
    let newContents = {};
    
    delete contents[`category-${i+1}`];
    const makeNewContents = Object.keys(contents).forEach((key,index) => {
      newContents[`category-${index+1}`] = {
        value:contents[key].value,
        voter:contents[key].voter,
      }
    });

    formErrors.contentsObj = newContents;

    this.setState({
      contents: newContents,
      voteCnt: voteCnt - 1,
      formErrors
    },this._handleUserInput(value, 'delete', i));
  }

  _makeVoteContent(cnt) {
    let arr = [];
    for(let i = 0; i < cnt; i++){
      if(i > 2){
        arr.push(
          <div key={i} className={'remove__contentsWrap'}>
            <i onClick={()=>{this._deleteContents(this.state.contents[`category-${i+1}`] ? this.state.contents[`category-${i+1}`].value : '', i)}}>
              <FontAwesomeIcon icon={faTimesCircle} size={'1x'} /> 
            </i>
            <input
              type="text" 
              className={`form-group__${this._errorLog(this.state.formErrors.contents)}`} 
              name="contents" 
              placeholder="항목 입력" 
              maxLength="10" 
              autoComplete="off"
              value={this.state.contents[`category-${i+1}`] ? this.state.contents[`category-${i+1}`].value : ''} 
              onChange={(event) => this._handleUserInput(event,'voteContents', i+1)} 
            />
          </div>
        );
      }else{
        arr.push(
          <input key={i} 
            type="text" 
            className={`form-group__${this._errorLog(this.state.formErrors.contents)}`} 
            name="contents" 
            placeholder="항목 입력" 
            maxLength="10" 
            autoComplete="off"
            value={this.state.contents[`category-${i+1}`] ? this.state.contents[`category-${i+1}`].value : ''} 
            onChange={(event) => this._handleUserInput(event,'voteContents', i+1)} 
          />
        );
      }
    }
    return arr;
  }

  _makeResults() {
    const { type, data } = this.props;
    const contents = {...this.state.contents};

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
          <div key={v} className={contents[v].voter.includes(this.state.author) ? 'categories top' : 'categories'}>
            <div className={'categories__contents clearfix pointer'} onClick={()=>{this._clickVote(v)}}>
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
              className={`result__input form-group__${this._errorLog(this.state.formErrors.author)}`} 
              autoComplete='off' 
              id="author" 
              name="author" 
              placeholder="투표자 성함을 입력해주세요"               
              maxLength="10" 
              disabled={type === 'create' || type === 'ongoing' ? false : true}
              value={this.state.author} 
              onChange={(event) => this._handleUserInput(event, 'voting')}
            />
            <FormErrors formErrors={this.state.formErrors.author} />
          </label>
        )}
        {type === 'result' && categoryResult()}
        {type === 'result' && (
          <label className={'label__alone'}>
            <input 
              type="password" 
              className={`result__input form-group__${this._errorLog(this.state.formErrors.password)}`} 
              autoComplete='off' 
              maxLength="20"
              id="password"  
              name="password" 
              placeholder="비밀번호" 
              value={this.state.password} 
              onChange={(event) => this._handleUserInput(event)} 
            />
          </label>
        )}
      </div>
    )
  }

  _clickVote = (category) => {
    if(this.state.author !== '' && this.state.authorValid !== false){
      let newState = {...this.state.contents};
      const getOriginData = JSON.parse(JSON.stringify(this.state.formErrors.contentsObj));

      let exludeObj = {};

      const mappingExcludeAuthor = Object.keys(getOriginData).forEach(v => {
        if(getOriginData[v].voter.includes(this.state.author)){
          exludeObj = {
            category: v,
            value: getOriginData[v].value,
            voter: getOriginData[v].voter
          }
        }
      });

      if(Object.keys(exludeObj).length){ //동일한 투표자 중복투표시
        const excludeAuthor = exludeObj.voter.findIndex(value => {
          return value === this.state.author;
        });
        exludeObj.voter.splice(excludeAuthor, 1);
  
        getOriginData[exludeObj.category] = {
          value:exludeObj.value,
          voter:exludeObj.voter
        }
      }
      
      newState = {...getOriginData};
      newState[category].voter.push(this.state.author);

      this.setState({
        contents:newState,
        selectedCategory:category,
        votingValid : true
      });
    }else{
      return alert('투표자 성함을 입력해주세요.');
    }
  }

  _errorLog(error) {
    return(error.length === 0 ? '' : 'has-error');
  }

  _addContent() {
    const newCnt = this.state.voteCnt;
    if(newCnt >= this.state.categoryLimit){
      return;
    } else {
      this.setState({
        voteCnt: newCnt + 1
      });
    }    
  }

  render(){
    const {type, onClose} = this.props;
    return(      
      <div className={'modal'}>
        {type === 'create' || type === 'setting' ? (
          <div className={'modal__main'}>
            <label className={'label__alone'}>
              <input 
                type="text" 
                className={`form-group__${this._errorLog(this.state.formErrors.title)}`} 
                autoComplete='off' 
                id="title" 
                name="title" 
                placeholder="제목" 
                maxLength="15" 
                value={this.state.title} 
                onChange={(event) => this._handleUserInput(event)} 
              />
              <FormErrors formErrors={this.state.formErrors.title} />
            </label>
            <label className={'label__alone'}>
              <input 
                type="text" 
                className={`form-group__${this._errorLog(this.state.formErrors.author)}`} 
                autoComplete='off' 
                id="author" 
                name="author" 
                placeholder="작성자"               
                maxLength="10" 
                disabled={type === 'create' ? false : true}
                value={this.state.author} 
                onChange={(event) => this._handleUserInput(event)}
              />
              <FormErrors formErrors={this.state.formErrors.author} />
            </label>
            <label className={'label__alone'}>
              <input 
                type="password" 
                className={`form-group__${this._errorLog(this.state.formErrors.password)}`} 
                autoComplete='off' 
                maxLength="20" 
                id="password" 
                name="password" 
                placeholder="비밀번호" 
                value={this.state.password} 
                onChange={(event) => this._handleUserInput(event)} 
              />
              <FormErrors formErrors={this.state.formErrors.password} />
            </label>
            <label className={'label__text'}>
              {this._makeVoteContent(this.state.voteCnt)}
              <FormErrors formErrors={this.state.formErrors.contents} />
            </label>
            <label className={'label__button'} style={{display: this.state.voteCnt >= this.state.categoryLimit ? 'none' : 'block'}}>
              <Button className={'add__button'} onClick={(()=>{this._addContent()})}>
                <FontAwesomeIcon icon={faPlus} /> 항목 추가
              </Button>
            </label>
            <div className={'modal_datepicker clearfix'}>
              <div className={'datepicker__title'}>시작</div>
              <DatePicker
                mode="time"
                selected={this.state.startedAt}
                className={`form-group__${this._errorLog(this.state.formErrors.startedAt)}`} 
                showTimeSelect
                dateFormat="yyyy.MM.dd HH:mm"
                onChange={this._handleStartedDateChange}
                timeIntervals={10}
                minDate={moment().toDate()}
                minTime={this.state.minTime}
                maxTime={moment().endOf('day').toDate()}
              />                
              <FormErrors formErrors={this.state.formErrors.startedAt} />
            </div>
            <div className={'modal_datepicker clearfix'}>
              <div className={'datepicker__title'}>종료</div>
              <DatePicker
                selected={this.state.endedAt}
                className={`form-group__${this._errorLog(this.state.formErrors.endedAt)}`} 
                showTimeSelect
                dateFormat="yyyy.MM.dd HH:mm"
                onChange={this._handleEndedDateChange}
                timeIntervals={10}
                minDate={moment().toDate()}
                minTime={moment(this.state.minTime).add({hours: 1}).toDate()}
                maxTime={moment().endOf('day').toDate()}
              />
              <FormErrors formErrors={this.state.formErrors.endedAt} />
            </div>
          </div>
        ) : (type === "result" ? (
          <div className={'modal__results'}>
            {this._makeResults()}
          </div>
        ) : (
          <div className={'modal__results'}>
            {this._makeResults()}
          </div>
        )
        )}
        <div className={"modal__footer"}>
          <Button className={'default__button'} onClick={(()=>{onClose()})}>닫기</Button>
          {type !== 'result' && type !== "ongoing" ? <Button className={'nav__button'} onClick={(()=>{this._save(onClose)})} disabled={!this.state.formValid}>저장</Button> : null}
          {type === 'ongoing' && <Button className={'nav__button'} onClick={(()=>{this._poll(onClose)})} disabled={!this.state.formValid || !this.state.votingValid || this.state.selectedCategory === ""}>투표하기</Button>}
          {type === 'setting' || type === 'result' ? <Button className={'delete__button'} onClick={(()=>{this._delete(onClose)})} disabled={!this.state.formValid}>삭제</Button> : null}
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  data: PropTypes.object, 
  type: PropTypes.string, 
  onClose: PropTypes.func, 
  handleSave: PropTypes.func,
  handleDelete: PropTypes.func
};