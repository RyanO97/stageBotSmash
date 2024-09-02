const mysql = require('mysql2');
const { dburl } = require('./config.json');
const connection = mysql.createConnection(dburl);
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
	query: (sql) => {
		return new Promise((resolve, reject) => {
			connection.query(sql, (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
};

module.exports = database;
