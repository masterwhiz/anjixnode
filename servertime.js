// var servertime = + new Date;

var moment = require('moment-timezone');
var zone = "Africa/Lagos";

var servertime = new Date();
var time = moment.tz(servertime, zone);
console.log(time.format('YYYYMMDD/HHmmss'));