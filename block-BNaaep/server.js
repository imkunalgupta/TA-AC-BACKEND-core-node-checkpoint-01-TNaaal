var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var server = http.createServer(handlerequest);
var usersPath = __dirname + '/contacts/';
function handlerequest(req, res) {
  let parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  var store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });
  req.on('end', () => {
    //WebPage
    if (pathname === '/' && req.method === 'GET') {
      fs.createReadStream(__dirname + '/index.html').pipe(res);
    } else if (pathname === '/about' && req.method === 'GET') {
      fs.createReadStream(__dirname + '/about.html').pipe(res);
    }
    //css
    else if (
      (req.method === 'GET' && pathname.split('.').pop() === 'css') ||
      pathname.split('.').pop() === 'scss'
    ) {
      res.setHeader('Content-Type', 'text/css');
      fs.readFile('./assets/' + pathname, (err, content) => {
        if (err) return console.log(err);
        return res.end(content);
      });
    } else if (
      pathname.split('.').pop().toLowerCase() === 'jpg' ||
      pathname.split('.').pop().toLowerCase() === 'jpeg' ||
      pathname.split('.').pop().toLowerCase() === 'webp'
    ) {
      res.setHeader(
        'Content-Type',
        `image/${pathname.split('.').pop().toLowerCase()}`
      );
      fs.readFile('./assets/' + pathname, (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (pathname === '/users' && req.method === 'GET') {
      if (!req.url.includes('?')) {
        fs.readdir(usersPath, function (err, files) {
          if (err) {
            return console.log('Unable to scan directory: " + err');
          }
          var length = files.length;
          var count = 1;
          files.forEach(function (file) {
            console.log(file);
            fs.readFile(usersPath + file, (err, content) => {
              if (err) return console.log(err);
              if (count < length) {
                count++;
                res.write(content);
              } else {
                return res.end(content);
              }
            });
          });
        });
      } else {
        var username = parsedUrl.query.username;
        fs.readFile(userPath + username + '.json', (err, content) => {
          if (err) return console.log(err);
          res.setHeader('Content-Type', 'application/json');
          return res.end(content);
        });
      }
    }
    //To get user
    else if (pathname === '/contact' && req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./contact.html').pipe(res);
    }
    //To Save User
    else if (pathname === '/form' && req.method === 'POST') {
      var username = JSON.parse(store).username;
      fs.open(usersPath + username + '.json', 'wx', (err, fd) => {
        if (err) return console.log(err);
        fs.writeFile(fd, store, (err) => {
          if (err) return console.log(err);
          fs.close(fd, () => {
            return res.end(`${username} created successfully`);
          });
        });
      });
    }
    //error
    else {
      res.statusCode = 404;
      res.end('Page not Found');
    }
  });
}
server.listen(5000, () => {
  console.log('Server listening on port 5k');
});
