exports.redisOpts = {
	redis: {
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || '127.0.0.1',
		db: 0,
		password: process.env.REDIS_PASS
	},
	settings: {
		lockDuration: 12e4
	}
};