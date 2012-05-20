#!/usr/bin/node

var http = require('http');
var url = require('url');
var cp = require('child_process');
var last_command = 'black';

// path to linkm-tool command
var linkm = 'linkm-tool';

// shortcuts for the standard blinkm scripts
var commands = {
  'on': {
    name: 'Lights On',
    command: ['--on']
  },
  'off':{
    name: 'Lights Off',
    command: ['--off']
  },
  'white': {
    name: 'White',
    command: ['--color',"'ff,ff,ff'"]
  },
  'red': {
    name: 'Red',
    command:  ['--color',"'ff,00,00'"]
  },
  'green': {
    name: 'Green',
    command:  ['--color',"'00,ff,00'"]
  },
  'blue': {
    name: 'Blue',
    command:  ['--color',"'00,00,ff'"]
  },
  'black': {
    name: 'Black',
    command:  ['--color',"'00,00,00'"]
  },
  '0': {
    name: 'User Program',
    command:  ['--playset', '1,0,4,48']
  },
  '1': {
    name: 'RGB',
    command:  ['--playset', '1,1,4,48']
  },
  '2': {
    name: 'White Flash',
    command:  ['--playset', '1,2,48,4']
  },
  '3': {
    name: 'Red Flash',
    command:  ['--playset', '1,3,48,4']
  },
  '4': {
    name: 'Green Flash',
    command:  ['--playset', '1,4,4,48']
  },
  '5': {
    name: 'Blue Flash',
    command:  ['--playset', '1,5,4,48']  
  },
  '6': {
    name: 'Cyan Flash',
    command:  ['--playset', '1,6,4,48']  
  },
  '7': {
    name: 'Magenta Flash',
    command:  ['--playset', '1,7,4,48']  
  },
  '8': {
    name: 'Yellow Flash',
    command:  ['--playset', '1,8,4,48']  
  },
  '9': {
    name: 'Black (off)',
    command:  ['--playset', '1,9,4,48']  
  },
  '10': {
    name: 'Hue Cycle',
    command:  ['--playset', '1,10,4,48']  
  },
  '11': {
    name: 'Mood Light',
    command:  ['--playset', '1,11,4,48']  
  },
  '12': {
    name: 'Candle',
    command:  ['--playset', '1,12,4,48']  
  },
  '13': {
    name: 'Water',
    command:  ['--playset', '1,13,4,48']
  },
  '14': {
    name: 'Neon Sign',
    command:  ['--playset', '1,14,4,48']  
  },
  '15': {
    name: 'Seasons',
    command:  ['--playset', '1,15,4,48']  
  },
  '16': {
    name: 'Thunderstorm',
    command:  ['--playset', '1,16,4,48']  
  },
  '17': {
    name: 'Stop Light',
    command:  ['--playset', '1,17,4,48']  
  },
  '18': {
    name: 'S.O.S.',
    command:  ['--playset', '1,18,4,48']
  },
  'random': {
    name: 'Random Colors',
    command:  ['--random', 50]
  },
  'defaultoff': {
    name: 'Disable Default',
    command:  ['--playset', '0']
  }
};

// makes links that can be used from web interface
function make_links(host, key) {
  var links = "";
  for (var c in commands) {
    var link = 'http:\/\/' + host + '/lights?cmd=' + c;
    if (key) {
      link += '&key=' + key;
    }
    links += '<a href="' + link + '">' + commands[c]['name'] + '</a><br>';
  }
  return links;
}

function send_command(command) {
  //TODO: re-add address param support
  if (commands[command]['command']) {
    cp.spawn(linkm, commands[command]['command']);
  }
}

// put whatever you want to do on a notification in here
function growl() {
  // node is asynchronous so this was a quick dirty way to
  // execute these sequentially
  send_command('defaultoff');
  setTimeout(send_command, 50, 'off');
  setTimeout(send_command, 100, 'red');
  setTimeout(send_command, 1000, last_command);
}

// init
var port = '8124';
var key;
process.argv.forEach(function(val, index, array) {
  var name = val.substr(0,2);
  var value = val.substr(2);
  if (name == '-p') {
    port = value;
  } else if (name == '-k') {
    key = value;
  }
});

// This was copied from the ubiquitous node http server example
http.createServer(function (req, res) {
  var parsed_query = url.parse(req.url, true).query;
  if (parsed_query['key'] == key) {

    if (req.url.substr(1,6) == 'lights') {
      var cmd = parsed_query['cmd'];
      var addr = parsed_query['addr'];
      last_command = cmd;
      send_command(cmd, addr);
    } else if (req.url.substr(1,5) == 'growl') {
      growl();
    }
  
    res.writeHead(200);
    res.write(make_links(req.headers.host, key));
    res.end();

  } else {

    console.log('failed to match key');
    res.writeHead(403);
    res.end();

  }
  
}).listen(port);

console.log('Server running at http://127.0.0.1:' + port + '/');
console.log('server key is: ' + key);
