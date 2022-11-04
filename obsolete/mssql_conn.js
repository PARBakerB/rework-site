const sql = require('mssql')

const config = {
	user: 'bakerb',
	password: 'password',
	server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
	database: 'rework',
	instanceName: 'SQLEXPRESS',
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	},
	options: {
		//encrypt: true,
		trustServerCertificate: true
	}
}

async () => {
	try {
		await sql.connect(config)
		const result = await sql.query(`select * from phase.models`)
		console.log(result)
		console.log("hello")
	} catch (err) {
		console.log(err)
		console.log("bye")
		// ... error checks
	}
}