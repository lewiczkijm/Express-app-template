var log4js = require('log4js')
var config = require('../config')

var timeFMT = config.get('log:timeFMT')
var level   = config.get('log:level')

log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: {
      type: 'pattern',
      pattern: `%[${timeFMT}[%p] %c -%] %m%n`
    }}
  },
  categories: { default: { appenders: ['out'], level: level } }
});

module.exports = function(category){
  return log4js.getLogger(category)
}