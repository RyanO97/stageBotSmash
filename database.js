const mysql = require('mysql2');
const { dburl } = require('./config.json');
const connection = mysql.createPool(dburl);
const database = {
	connect: () => {
		if (!connection) {
			connection.connect(err => {
				if (err) throw err;
				console.log('Connected to the MySQL database!');
			});
		}
		return connection;
	},
	query: (sql, values) => {
		return new Promise((resolve, reject) => {
			connection.query(sql, values, (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
};

module.exports = database;
