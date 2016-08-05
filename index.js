var express = require('express'),
    fs = require('fs'),
    exec = require('child_process').exec,
    mime = require('mime'),
    path = require('path'),
    touch = require("touch"),
    mkdirp = require('mkdirp');


var host = process.env.HTTP_HOST || '0.0.0.0';
var port = process.env.HTTP_PORT || 3000;


var app = express();


app.get('/_ping', function (req, res) {
  res.status(200).end();
});


/**
  Bundle containing all the user's private keys and ssh configuration
 */
app.get('/ssh.tgz', function (req, res) {
  mkdirp("/vault/.ssh");
  exec('mktemp -q /tmp/ssh.XXXXXX', function (err, stdout) {
    var file = stdout.match(/(.+)/)[0];

    exec('tar -chz -C /vault/.ssh -f '+ file +' .', function (err, stdout, stderr) {
      var filename = path.basename(file);
      var mimetype = mime.lookup(file);

      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', mimetype);

      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
      fs.unlink(file)
    });
  });
});


/**
  Route to get the credenial store
 */
app.get('/git-credentials', function (req, res) {
  var file = '/vault/store/git-credentials';
  touch(file);
  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});


/**
  Route to get the ONVAULT utility to be used during build
 */
app.get('/ONVAULT', function (req, res) {
  var file = path.join(__dirname, 'ONVAULT');
  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});


app.use('/', express.static('/vault'));


app.listen(port, host, function () {
  console.log('Service started on port %d', port);
});
