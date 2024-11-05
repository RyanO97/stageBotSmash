const db = require('../database');

const view = 'front_json';
const results = {
	fetchPrefs: async (selected) => {
		try {
			const query = `select JSON_ARRAYAGG(stagePrefs) as stagePrefs from ${view} where fid in (select fid from ${view} where fid in (${Array(selected.length).fill('?').join(',')}))`;
			const rs = await db.execute(
				query, selected,
			);
			const response = JSON.parse(JSON.stringify(rs));
			return response[0].stagePrefs;
		}
		catch (error) {
			console.error('Error:', error);
		}
	},
	getDataFID: async () => {
		try {
			const query = `select JSON_ARRAYAGG(fid) as fid from ${view}`;
			const rs = await db.execute(
				query,
			);
			const response = JSON.parse(JSON.stringify(rs));
			return response[0].fid;
		}
		catch (error) {
			console.error('Error:', error);
		}
	},
};

module.exports = results;
