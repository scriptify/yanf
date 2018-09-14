const EventEmitter = require('events');

class NotificationsEmitter extends EventEmitter {

}

const notifications = new NotificationsEmitter();
module.exports = notifications;
