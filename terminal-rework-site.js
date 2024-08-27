import * as https from 'node:https';
import * as http from 'node:http';
import * as path from 'node:path';
import * as fs from 'node:fs';

import { combineLogs } from './backend/fileDate.js';
import { getMFG, getBOMFromProd, getSearchName, waveSerialSearch } from './backend/partObjects.js';
import { createPdf } from './backend/pdf.js';

import constants from "./backend/constants.js"
const fsm = constants.fsManager;

process.env.TZ = 'EST5EDT';
const PORT = 9615;
const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  json: 'application/json',
  mjs: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  mp3: 'audio/mp3',
  pdf: 'application/pdf'
};
const STATIC_PATH = path.join(process.cwd(), './frontend');
const DATABASE_PATH = path.join(process.cwd(), './database');
const logFileName = STATIC_PATH + '/logs/rework_' + Date().slice(0,-39).replace(/ /g, "_").replace(/:/g, "-") + '.csv';
var lastUpdate = Date().toString().slice(4,10) + " " + Date().toString().slice(13,15) + " at " + Date().toString().slice(16,21) + " EST";

const toBool = [() => true, () => false];

const updateDatabase = async (req, res, filename) => {
	let dataObject = "";
	req.on('data', async j => {
		dataObject += j.toString('utf8');
	});
	req.on('end', async () => {
		let fileSoFar = (await fsm.read(DATABASE_PATH + "/" + filename)).toString('utf8');
		// checks if this is the first post in a series
		if (dataObject.substring(0,50).search("PROD-000000") != -1) {
			await fsm.write(DATABASE_PATH + "/" + filename, "[]");
		} else {
			dataObject = dataObject.substring(1,dataObject.length);
			fileSoFar = fileSoFar.substring(0,fileSoFar.length-1);
			let newFile = fileSoFar === "[" ? fileSoFar + dataObject : fileSoFar + "," + dataObject;
			await fsm.write(DATABASE_PATH + "/" + filename, newFile);
		}
		res.end();
		lastUpdate = Date().toString().slice(4,10) + " " + Date().toString().slice(13,15) + " at " + Date().toString().slice(16,21);
		console.log("Logged to: " + filename);
	});
}

const getResponse = async (url) => {
	if (url.endsWith('log.csv')) {
		await combineLogs();
		const found = true;
		const paths = [STATIC_PATH, '/logs/', 'Rework_Log_Combined.csv'];
		const filePath = path.join(...paths);
		const ext = path.extname(filePath).substring(1);
		const stream = await fsm.readStream(filePath);
		return { found, ext, stream };
	} else {
		const paths = [STATIC_PATH, url];
		if (url.endsWith('/')) paths.push('index.html');
		const filePath = path.join(...paths);
		const pathTraversal = !filePath.startsWith(STATIC_PATH);
		const exists = await fsm.access(filePath).then(...toBool);
		const found = !pathTraversal && exists;
		const streamPath = found ? filePath : STATIC_PATH + '/404.html';
		const ext = path.extname(streamPath).substring(1).toLowerCase();
		const stream = await fsm.readStream(streamPath);
		return { found, ext, stream };
	}
};
const postResponse = async (req, res) => {
	fsm.append(logFileName, req.url.substring(1) + '\n', function (err) {if (err) throw err;});
	const found = true;
	const ext = 'html';
	const streamPath = [STATIC_PATH, '/', 'index.html'];
	const stream = await fsm.readStream(path.join(...streamPath));
	return { found, ext, stream };
};
const fileServ = async (req, res) => {
	if (req.url === '/420getMFG420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			response = await getMFG(response);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(response));
			res.end();
		});
	} else if (req.url === '/420getPROD420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			response = await getBOMFromProd(response);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(response));
			res.end();
		});
	} else if (req.url === '/420savePart420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			response = JSON.parse(response);
			let jsonObjectsFile = await fsm.read(DATABASE_PATH+"/SavedParts.json");
			let jsonObjects = JSON.parse(jsonObjectsFile);
			jsonObjects[response.fields[0]] = response;
			await fsm.write(DATABASE_PATH+"/SavedParts.json", JSON.stringify(jsonObjects));
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(response));
			res.end();
		});
	} else if (req.url === '/420getSavedPart420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			let jsonObjectsFile = await fsm.read(DATABASE_PATH+"/SavedParts.json");
			let jsonObjects = JSON.parse(jsonObjectsFile);
			if (JSON.stringify(jsonObjects[response]) != undefined) res.write(JSON.stringify(jsonObjects[response]));
			else res.write("undefined");
			res.end();
		});
	} else if (req.url === '/420getSearchName420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
			let searchName = await getSearchName(response);
			res.write(searchName);
			res.end();
		});
	} else if (req.url === '/420getPDFPages420') {
		let response = "";
		req.on('data', async j => {
			response = JSON.parse(j.toString('utf8'));
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': MIME_TYPES['pdf'] });
			let pdfData = await createPdf(response);
			await fsm.write('./frontend/print.pdf', pdfData);
			res.write("print.pdf");
			res.end();
		});
	} else if (req.url === "/PROD-BOM-UPDATE") {
		updateDatabase(req, res, "prodboms.json");
	} else if (req.url === "/PROD-HEADERS") {
		updateDatabase(req, res, "prodheaders.json");
	} else if (req.url === "/lastUpdate") {
		req.on('data', ()=>{});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': MIME_TYPES['html'] });
			res.write("<p>The last database update was on " + lastUpdate + "</p>");
			res.end();
		});
	} else if (req.url === "/Cycle-Date") {
		let response = "";
		req.on('data', async j => {
			response = JSON.parse(j.toString('utf8'));
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': MIME_TYPES['pdf'] });
			let pdfData = await createPdf(response);
			await fsm.write('./frontend/cycle.pdf', pdfData);
			res.write("cycle.pdf");
			res.end();
		});
	}else if (req.url === "/Service-Repair-Label") {
		let response = "";
		req.on('data', async j => {
			response = JSON.parse(j.toString('utf8'));
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': MIME_TYPES['pdf'] });
			let pdfData = await createPdf(response);
			await fsm.write('./frontend/SRL.pdf', pdfData);
			res.write("SRL.pdf");
			res.end();
		});
	} else if (req.url === "/CTOLoadLog") {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
			await fsm.append('./database/LoadLog.csv', response);
			//let log = await fsm.read('./database/LoadLog.csv');
			res.write("Log Received");
			res.end();
		});
	} else if (req.url == '/PARWaveSerialSearch') {
		let inputData = "";
		req.on('data', async reqData => {
			inputData = reqData.toString('utf8');
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
			let resData = await waveSerialSearch(inputData);
			console.log(resData);
			res.write(resData);
			res.end();
		});
	} else {
		const file = req.method === 'POST' ? await postResponse(req, res) : await getResponse(req.url);
		const statusCode = file.found ? 200 : 404;
		const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
		res.writeHead(statusCode, { 'Content-Type': mimeType });
		file.stream.pipe(res);
		console.log(`${req.method} ${req.url} ${statusCode}`);
	}
};

try {
	const options = {
		key: fs.readFileSync('./STAR_partech_com.key'),
		cert: fs.readFileSync('./STAR_partech_com.crt')
	};
	https.createServer(options, fileServ).listen(PORT);
	console.log("Server running at https://172.17.17.248:" + PORT + "/");
}
catch {
	http.createServer(fileServ).listen(PORT);
	console.log("Server running at http://172.17.17.248:" + PORT + "/");
}