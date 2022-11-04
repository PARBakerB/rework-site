var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

// Create connection to database

function makeConnection() {
	var config = {
	  server: 'localhost',
	  authentication: {
		  type: 'default',
		  options: {
			  userName: 'bakerb', // update me
			  password: 'password' // update me
		  }
	  },
	  options: {
		  instanceName: 'SQLEXPRESS',
		  database: 'rework',
		  trustServerCertificate: true
	  }
	}
	return new Promise((resolve, reject) => {
		var connection = new Connection(config);
		connection.on('connect', function(err) {
			if (err) reject(err);
			request = new Request(
				'DELETE FROM phase.models WHERE model_pn=M9100-11;',
				function(err, rowCount, rows) {
					if (err) {
						reject(err);
					} else {
						console.log(rowCount + ' row(s) returned');
					}
				}
			);
			request.addParameter('model_pn', TYPES.VarChar, 'M9100-11');
			connection.execSql(request);
		});
		resolve(connection);
	});
}
module.exports = {makeConnection};