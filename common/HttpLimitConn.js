const schedule = require('node-schedule');

class HttpLimitConn {
	constructor({ limit, space, debug }) {
		this.limit = limit || 60;
		this.space = space || '30 * * * * *';
		this.debug = debug ? true : false;
		this.pools = {};
		this.startSchedule();
	}
	getClientIp(req) {
		return (
			req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress ||
			''
		);
	}
	verifyClient(req) {
		if (this.debug) return true;
		let ip = this.getClientIp(req);
		if (!(ip in this.pools)) {
			this.pools[ip] = 0;
		}
		if (this.pools[ip]++ > this.limit) {
			return false;
		} else {
			return true;
		}
	}
	startSchedule() {
		schedule.scheduleJob(this.space, () => {
			for (var key in this.pools) {
				delete this.pools[key];
			}
		});
	}
}

module.exports = HttpLimitConn;
