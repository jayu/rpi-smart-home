/*
TODO
- export all gpio setup to separated file
- constructor LCD with number of pins etc.
- module display to manage displaying screens: welcome, general info, music player, videoplayer, 
- button to show general screen for a 5 sec when i.e music is playing
- lcd display styles , left, center

*/

const gpio = require('rpi-gpio')
var sleep = require('sleep');
const SetupOut = (pin) => {
  return new Promise((resolve, reject) => {
    gpio.setup(pin, gpio.DIR_OUT, () => { resolve() })
  })
}
const Write = (pin) => (value) => {
  return new Promise((resolve, reject) => {
    gpio.write(pin, value, () => { resolve() })
  })

}
const PromiseQueue = (actions) => {
  return new Promise((resolve, reject) => {
    const execute = () => {
      return actions.shift()().then(() => {
        if (actions.length > 0) {
          return execute()
        } else {
          resolve()
        }
      })
    }
    execute()
  })
}
var displayPorts = {
  RS: 38,
  E: 40,
  D4: 33,
  D5: 35,
  D6: 37,
  D7: 36,

  CHR: 1,
  CMD: 0
};


function LCD(displayConfig) {
  displayConfig = displayConfig || {};

  this._displayConfig = {
    width: displayConfig.width || 20,
    lines: [0x80, 0x80 | 0x40, 0x80 | 0x14, 0x80 | 0x54],

    pulse: displayConfig.pulse || 0.0001,
    delay: displayConfig.delay || 0.0001
  };

  this._ports = {
    rs: null,
    e: null,
    d4: null,
    d5: null,
    d6: null,
    d7: null
  };
}

LCD.prototype._sleep = function(seconds) {
  sleep.usleep(seconds * 1000000);
};


LCD.prototype.init = function(callback) {
  const self = this;
  console.log('init')
  Promise.all([
      SetupOut(displayPorts.D4),
      SetupOut(displayPorts.D5),
      SetupOut(displayPorts.D6),
      SetupOut(displayPorts.D7),
      SetupOut(displayPorts.E),
      SetupOut(displayPorts.RS),
    ])
    .then(() => {
      console.log('setup')
      self._ports.d4 = Write(displayPorts.D4)
      self._ports.d5 = Write(displayPorts.D5)
      self._ports.d6 = Write(displayPorts.D6)
      self._ports.d7 = Write(displayPorts.D7)
      self._ports.e = Write(displayPorts.E)
      self._ports.rs = Write(displayPorts.RS)
      return true
    })
    .then(() => {
      console.log('init display')
      return self._initDisplay();

    })
    .then(() => {
      callback.call(this);
    })
};
LCD.prototype._initDisplay = function() {
  const self = this;
	self._sleep(0.1)
  return PromiseQueue([
    (() => { return self.writeByte(0x33, displayPorts.CMD) }),
    (() => { return self.writeByte(0x32, displayPorts.CMD) }),
    (() => { return self.writeByte(0x28, displayPorts.CMD) }),
    (() => { return self.writeByte(0x0C, displayPorts.CMD) }),
    (() => { return self.writeByte(0x06, displayPorts.CMD) }),
    (() => { return self.writeByte(0x01, displayPorts.CMD) }),
  ])
};

LCD.prototype._clean = function() {
  for (var key in this._ports) {
    this._ports[key].unexport();
  }
};
LCD.prototype.clear = function() {
	return this.writeByte(0x01, displayPorts.CMD)
}
LCD.prototype.shutdown = function() {
  // this.writeString("\n");
  this._clean();
};

LCD.prototype.writeString = function(strings, center = false) {
  const self = this
  var lines = this._displayConfig.lines
  const linesActions = []
  if (center) {
	strings = strings.map((string) => {
		let spaces = ''
		for(let i = 0; i < (this._displayConfig.width - string.length) / 2; i++) {
			spaces += ' '
		}
		return spaces + string
	})
  }
  for (let i = 0; i < strings.length; i++) {
    linesActions.push(() => {
      return self.writeByte(lines[i], displayPorts.CMD).
      then(() => {
        const charsActions = []
        for (let j = 0; j < strings[i].length; j++) {
          const c = strings[i].charCodeAt(j) || 0x20;
          charsActions.push(() => {
            return self.writeByte(c, displayPorts.CHR);
          })
        }
        return PromiseQueue(charsActions)

      })

    })
  }
  console.log(linesActions)
  return PromiseQueue(linesActions)
};

LCD.prototype.writeByte = function(bits, mode) {
  const self = this;
  console.log('writing byte', bits, mode)
  return Promise.all([
      self._ports.rs(mode),
      self._ports.d4((bits & 0x10) == 0x10),
      self._ports.d5((bits & 0x20) == 0x20),
      self._ports.d6((bits & 0x40) == 0x40),
      self._ports.d7((bits & 0x80) == 0x80),
    ])
    .then(() => {
      self._sleep(this._displayConfig.delay);
      return self._ports.e(1);
    })
    .then(() => {
      self._sleep(self._displayConfig.pulse);
      return self._ports.e(0)
    })
    .then(() => {
      self._sleep(self._displayConfig.delay);
      return Promise.all([
        self._ports.rs(mode),
        self._ports.d4((bits & 0x1) == 0x1),
        self._ports.d5((bits & 0x2) == 0x2),
        self._ports.d6((bits & 0x4) == 0x4),
        self._ports.d7((bits & 0x8) == 0x8),
      ])
    })
    .then(() => {
      self._sleep(this._displayConfig.delay);
      return self._ports.e(1);
    })
    .then(() => {
      self._sleep(self._displayConfig.pulse);
      return self._ports.e(0)
    })
    .then(() => {
      self._sleep(self._displayConfig.delay);
      return true
    })
};

var lcd = new LCD();

// lcd.init(function() {
//   console.log('inited')
//   lcd.writeString(['linia 1', 'linia 2', 'linia 3' ,'linia 4'])
//     .then(() => {})
//   //lcd.shutdown();
// })

module.exports = lcd
