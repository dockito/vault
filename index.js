var express = require('express'),
    path = require('path');


var host = process.env.HTTP_HOST || '0.0.0.0';
var port = process.env.HTTP_PORT || 3000;


var app = express();


app.get('/_ping', function (req, res) {
  res.status(200).end();
});


app.use('/', express.static('/vault'));


app.listen(port, host, function () {
  console.log('Service started on port %d', port);
});
