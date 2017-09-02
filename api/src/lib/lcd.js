/*
TODO
- export all gpio setup to separated file
- module display to manage displaying screens: welcome, general info, music player, videoplayer, 
- button to show general screen for a 5 sec when i.e music is playing
- lcd display styles , left, center

*/

const gpio = require('rpi-gpio')
const sleep = require('sleep');
const { PromiseQueue } = require('./utils') 

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

function LCD(portNumbers) {
  this._displayConfig = {
    width: 20,
    lines: [0x80, 0x80 | 0x40, 0x80 | 0x14, 0x80 | 0x54],
    pulse: 0.0001,
    delay: 0.0001
  };
  this._portsNumbers = portNumbers;
  this._ports = {
    rs: null,
    e: null,
    d4: null,
    d5: null,
    d6: null,
    d7: null
  };
  this._commands = {
    CLEAR : 0x01,

  }
  this._mode = {
    CHR : 1,
    CMD : 0
  }
}

LCD.prototype._sleep = function(seconds) {
  sleep.usleep(seconds * 1000000);
};


LCD.prototype.init = function() {
  const self = this;
  console.log('init')
  return Promise.all([
      SetupOut(self._portsNumbers.D4),
      SetupOut(self._portsNumbers.D5),
      SetupOut(self._portsNumbers.D6),
      SetupOut(self._portsNumbers.D7),
      SetupOut(self._portsNumbers.E),
      SetupOut(self._portsNumbers.RS),
    ])
    .then(() => {
      console.log('setup')
      self._ports.d4 = Write(self._portsNumbers.D4)
      self._ports.d5 = Write(self._portsNumbers.D5)
      self._ports.d6 = Write(self._portsNumbers.D6)
      self._ports.d7 = Write(self._portsNumbers.D7)
      self._ports.e = Write(self._portsNumbers.E)
      self._ports.rs = Write(self._portsNumbers.RS)
      return true
    })
    .then(() => {
      console.log('init display')
      return self._initDisplay();
    })
};
LCD.prototype._initDisplay = function() {
  const self = this;
	self._sleep(0.1)
  // initial bytes sequence
  return PromiseQueue([
    (() => { return self.writeByte(0x33, self._mode.CMD) }), // ?
    (() => { return self.writeByte(0x32, self._mode.CMD) }), // ?
    (() => { return self.writeByte(0x28, self._mode.CMD) }), // ?
    (() => { return self.writeByte(0x0C, self._mode.CMD) }), // display on, cursor off, cursor blink off
    (() => { return self.writeByte(0x06, self._mode.CMD) }), // left to right, no shift
    (() => { return self.writeByte(self._commands.CLEAR, self._mode.CMD) }), // clear display
  ])
};

LCD.prototype._clean = function() {
  for (var key in this._ports) {
    this._ports[key].unexport();
  }
};
LCD.prototype.clear = function() {
	return this.writeByte(this._commands.CLEAR, this._mode.CMD)
}
LCD.prototype.shutdown = function() {
  // this.writeString("\n");
  this._clean();
};

LCD.prototype.writeString = function(strings, center = true) {
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
      return self.writeByte(lines[i], self._mode.CMD).
      then(() => {
        const charsActions = []
        for (let j = 0; j < strings[i].length; j++) {
          const c = strings[i].charCodeAt(j) || 0x20;
          charsActions.push(() => {
            return self.writeByte(c, self._mode.CHR);
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

var lcd = new LCD({
  RS: 38,
  E: 40,
  D4: 33,
  D5: 35,
  D6: 37,
  D7: 36,
});

module.exports = lcd
