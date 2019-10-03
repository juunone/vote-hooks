import * as types from '../actions/ActionTypes'
import { all, put, takeEvery } from 'redux-saga/effects'

function* fetchDataStart() {
  yield takeEvery(types.FETCH_DATA_START, fetching);
}

function* fetchDataSuccess(data) {
  yield put({ 
    type: types.FETCH_DATA_SUCCESS,
    payload: { data } 
  })
}

function* fetchDataFailure(error) {
  yield put({ 
    type: types.FETCH_DATA_FAILURE,
    payload: { error }
  })
}

function* fetching(action) {
  try {
    const data = yield fetchData(action.payload.method, action.payload.data, action.payload.path);
    yield fetchDataSuccess(data)
  } catch (error) {
    yield fetchDataFailure(error)
  }
}

export default function* rootSaga() {
  yield all([
    fetchDataStart(),
  ])
}

const fetchData = (method = 'GET', data, path = '') => {
  let id = "";
  if(method === 'PUT' || method === 'DELETE') id = data && data.id;
  let header = {'Content-Type':'application/json', 'Accept': 'application/json'};
  if(data && method !== 'DELETE'){            
    header = {'Content-Type':'application/x-www-form-urlencoded'}
  }  

  const searchParams = (params) => {
    return Object.keys(params).map((key) => {
      if(key === 'contents') return encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(params[key]));
      else return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
  }

  return fetch(`/api/votes/${path}${id}`, {
    headers : header,
    method: method && method,
    body: data && method !== 'DELETE' ? searchParams(data) : undefined
  })
    .then(handleErrors)
    .then(res => {
      return res.json()
    })
    .catch(error => {
      return error
    });
}

const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}