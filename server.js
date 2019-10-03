var fs = require('fs');
var path = require('path');
var Q = require('q');
// const cors = require('cors');

var express = require('express');
var bodyParser = require('body-parser');

var port = 9999;

var voteFile = path.join(__dirname, 'votes.json');

var app = express();
var appRouter = express.Router();

app.use('/', express.static(path.join(__dirname, 'src')));
// app.use(cors());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({extended: true}));


var readData = function () {
  var defer = Q.defer();

  fs.readFile(voteFile, function (error, data) {
    if (error) {
      return defer.reject(error);
    }
    
    return defer.resolve(JSON.parse(data));
  });

  return defer.promise;
};

var writeData = function (data) {
  var defer = Q.defer();

  fs.writeFile(voteFile, JSON.stringify(data, null, 2), function (error) {
    if (error) {
      return defer.reject(error);
    }

    return defer.resolve();
  });

  return defer.promise;
};

var getVotes = function (id, method = 'get', newData, path) {
  if(id && method !== "put") {
    return readData().then(function (data) {
      return getDataById(data, id);
    });
  } else if(method === 'get') {
    return readData().then(function (data) {
      return data;
    });
  } else {
    return readData().then(function (data) {
      return pushDataById(data, id, newData, path);
    });
  }
};

var getDeleteVotes = function (id) {
  return readData().then(function (data) {
    return deleteVote(id,data);
  });
};

var deleteVote = function(id,data) {
  var getDataIdx = data.findIndex(v => {
    return String(v.id) === id;
  });
  data.splice(getDataIdx, 1);
  return data;
}

var getDataById = function (data, id) {
  var getDataIdx = data.findIndex(v => {
    if(String(v.id) === id) return v;
  });
  return data[getDataIdx];
};

var pushDataById = function (data, id, newData, path) {
  var getDataIdx = data.findIndex(v => {
    if(String(v.id) === id) return v;
  });
  var topVote = getTopAcquisitionVote(JSON.parse(newData.contents));

  if(path){
    data[getDataIdx].contents = JSON.parse(newData.contents);
    data[getDataIdx].topAcquisitionVote = topVote;
  }else{
    data[getDataIdx].title = newData.title;
    data[getDataIdx].author = newData.author;
    data[getDataIdx].startedAt = Number(newData.startedAt);
    data[getDataIdx].endedAt = Number(newData.endedAt);
    data[getDataIdx].contents = JSON.parse(newData.contents);
    data[getDataIdx].topAcquisitionVote = topVote;
  }
  return data;
};

var getTopAcquisitionVote = function (res) {
  var contents = res;
  var topAcquisitionVote = 0;
  Object.keys(contents).forEach((v)=>{
    if(topAcquisitionVote === 0){
      topAcquisitionVote = contents[v].voter.length;
    } else if( contents[v].voter.length > Number(topAcquisitionVote) ){
      topAcquisitionVote = contents[v].voter.length;
    } 
  });
  return Number(topAcquisitionVote);
}

app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// list
appRouter.get('/', function (req, res) {
  getVotes().then(function (data) {
    res.json(data);
  }).fail(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});

// write
appRouter.post('/', function (req, res) {
  readData().then(function (data) {
    var topVote = getTopAcquisitionVote(JSON.parse(req.body.contents));
    var newData = {
      id: Date.now(),
      author: req.body.author,
      title: req.body.title,
      password: req.body.password,
      contents: JSON.parse(req.body.contents),
      startedAt: Number(req.body.startedAt),
      endedAt: Number(req.body.endedAt),
      topAcquisitionVote:topVote
    };


    data.unshift(newData);

    return writeData(data).then(function () {
      res.json(data);
    }).fail(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
  });
});

// delete
appRouter.delete('/:id', function (req, res) {
  var id = req.params.id;
  
  getDeleteVotes(id).then(function(newData){
    return writeData(newData).then(function () {
      res.json(newData);
    }).fail(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
  }).fail(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});

// get by id
appRouter.get('/:id', function (req, res) {
  var id = req.params.id;

  getVotes(id).then(function (data) {
    res.json(data);
  }).fail(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});

// put
appRouter.put('/:id', function (req, res) {
  var id = req.params.id;
  var newData = req.body;

  getVotes(id, 'put', newData).then(function (r) {
    return writeData(r).then(function () {
      res.json(r);
    }).fail(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
  }).fail(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});

//poll
appRouter.put('/poll/:id', function (req, res) {
  var id = req.params.id;
  var newData = req.body;

  getVotes(id, 'put', newData, 'poll').then(function (r) {
    return writeData(r).then(function () {
      res.json(r);
    }).fail(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
  }).fail(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});

app.use('/api/votes', appRouter);

app.listen(port, function () {
  console.log('Server started: http://localhost:' + port + '/');
});