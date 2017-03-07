var express = require('express'),
    fs = require('fs'),
    exec = require('child_process').exec,
    mime = require('mime'),
    path = require('path'),
    mkdirp = require('mkdirp');


var host = process.env.HTTP_HOST || '0.0.0.0';
var port = process.env.HTTP_PORT || 3000;


var app = express();


app.get('/_ping', function (req, res) {
  res.status(200).end();
});


var keyDirs = (process.env.VAULT_DIRS || 'ssh').split(' ');

/**
  Bundle containing all the user's private keys and "keyDir" configuration
 */
app.get('/:keyDir\.tgz', function (req, res) {
  keyDir = req.params.keyDir;

  if (keyDirs.indexOf(keyDir) == -1) {
    res.status(404).send('Not found');
  } else {
    mkdirp("/vault/." + keyDir);
    exec('mktemp -q /tmp/key_dir.XXXXXX', function (err, stdout) {
      var file = stdout.match(/(.+)/)[0];

      exec('tar -chz -C /vault/.' + keyDir + ' -f '+ file +' .', function (err, stdout, stderr) {
        var filename = path.basename(file);
        var mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
        fs.unlink(file)
      });
    });
  }
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
