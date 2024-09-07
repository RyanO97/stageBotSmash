const db = require('../database');

const results = async () => {
	try {
		const rs = await db.query(
			'select JSON_ARRAYAGG(stagePrefs) as stagePrefs from front_json',
		);
		const array = JSON.parse(JSON.stringify(rs));
		return array[0].stagePrefs;
	}
	catch (error) {
		console.error('Error:', error);
	}
};

module.exports = results;
