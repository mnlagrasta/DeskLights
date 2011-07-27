#!/usr/bin/node

var http = require('http');
var url = require('url');
var cp = require('child_process');

// path to linkm-tool command
var linkm = './linkm-tool';

// shortcuts for the standard blinkm scripts
var cmd = {
  'on': ['--on'],
  'off': ['--off'],
  'white': ['--color',"'ff,ff,ff'"],
  'red': ['--color',"'ff,00,00'"],
  'green': ['--color',"'00,ff,00'"],
  'blue': ['--color',"'00,00,ff'"],
  'black': ['--color',"'00,00,00'"],
  '0': ['--play', 0],
  'default': ['--play', 0],
  '1': ['--play', 1],
  'rgb': ['--play', 1],
  '2': ['--play', 2],
  'white_flash': ['--play', 2],
  '3': ['--play', 3],  
  '4': ['--play', 4],  
  '5': ['--play', 5],  
  '6': ['--play', 6],  
  '7': ['--play', 7],  
  '8': ['--play', 8],  
  '9': ['--play', 9],  
  '10': ['--play', 10],  
  '11': ['--play', 11],  
  '12': ['--play', 12],  
  '13': ['--play', 13],  
  '14': ['--play', 14],  
  '15': ['--play', 15],  
  '16': ['--play', 16],  
  '17': ['--play', 17],  
  '18': ['--play', 18],  
};

// makes links that can be used from web interface
function make_links(host) {
  var links = "";
  for (var k in cmd) {
    var link = 'http:\/\/' + host + '/lights?cmd=' + k;
    links += '<a href="' + link + '">' + k + '</a><br>';
  }
  return links;
}


function send_command(command) {
  if (cmd[command]) {
    cp.spawn(linkm, cmd[command]);
  }
}

// put whatever you want to do on a notification in here
function growl() {
  send_command('off');
  // node is asynchronous so this was a quick dirty way to
  // execute these sequentially
  setTimeout(send_command, 500, 'red');
  setTimeout(send_command, 1500, 'black');
}

// This was copied by the ubiquitous node http server example
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var parsed_query = url.parse(req.url, true).query;

  if (req.url.substr(1,6) == 'lights') {
    send_command(parsed_query['cmd'], parsed_query['addr']);
  } else if (req.url.substr(1,5) == 'growl') {
    growl();
  } else if (req.url.substr(1,6) == 'spread') {
    spread();
  } else {
    // not recognized, maybe return a 503?
    //console.log("unrecognized url: " + req.url);
  }

  res.writeHead(202);
  res.write(make_links(req.headers.host));
  res.end();
  
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');