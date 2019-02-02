
//not used for now.
module.exports = {
	dbPath: function () {
		var knex = require('knex')({
			client: 'oracledb',
			connection: {
				user : 'sagiwal',
				password : 'S7335mpm#',
				connectString:  'oracle.cise.ufl.edu:1521/orcl'
			}
		});
	}
}