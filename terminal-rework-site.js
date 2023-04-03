import * as https from 'node:https';
//import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'buffer';

import { greatestLogDate } from './modules/fileDate.js';
import { getModel, compareModels, getMFG, getBOMFromProd, getSearchName } from './modules/partObjects.js';
import { createPdf } from './modules/pdf.js';

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
const STATIC_PATH = path.join(process.cwd(), './static');
const DATABASE_PATH = path.join(process.cwd(), './database');

const logFileName = STATIC_PATH + '/logs/' + Date().slice(0,-39).replace(/ /g, "_") + '.csv';
const options = {
	key: fs.readFileSync('./STAR_partech_com.key'),
	cert: fs.readFileSync('./STAR_partech_com.crt')
};

const toBool = [() => true, () => false];

const getResponse = async (url) => {
	if (url.endsWith('log.csv')) {
		const found = true;
		const paths = [STATIC_PATH, '/logs/', greatestLogDate()];
		const filePath = path.join(...paths);
		const ext = path.extname(filePath).substring(1);
		const stream = fs.createReadStream(filePath);
		return { found, ext, stream };
	} else {
		const paths = [STATIC_PATH, url];
		if (url.endsWith('/')) paths.push('index.html');
		const filePath = path.join(...paths);
		const pathTraversal = !filePath.startsWith(STATIC_PATH);
		const exists = await fs.promises.access(filePath).then(...toBool);
		const found = !pathTraversal && exists;
		const streamPath = found ? filePath : STATIC_PATH + '/404.html';
		const ext = path.extname(streamPath).substring(1).toLowerCase();
		const stream = fs.createReadStream(streamPath);
		return { found, ext, stream };
	}
};
const postResponse = async (req, res) => {
	if (req.url === "/PROD-BOM-UPDATE") {
		/* Wiped the file every time a post was received, now updated every time data starts from beginning
		fs.writeFileSync(
			STATIC_PATH + "/prodboms.json",
			"",
			err => {if (err) throw err;});
			*/
		req.on('data', async dataReceived => {
			// this if checks if this is the first post in a series
			if (JSON.parse(dataReceived)[0].ProductionOrderNumber == "PROD-000001") {
				fs.writeFileSync(
					DATABASE_PATH + "/prodboms.json",
					"",
					err => {if (err) throw err;});
			}
			fs.appendFile(
				DATABASE_PATH + "/prodboms.json",
				dataReceived,
				err => {if (err) throw err;});
		});
		req.on('end', async j => {
			res.end();
		});
	} else {
		fs.appendFile(logFileName, req.url.substring(1) + '\n', function (err) {if (err) throw err;});
	}
	const found = true;
	const ext = 'html';
	const streamPath = [STATIC_PATH, '/', 'index.html'];
	const stream = fs.createReadStream(path.join(...streamPath));
	return { found, ext, stream };
};
const fileServ = async (req, res) => {
	if (req.url === '/420compare420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
			response = JSON.parse(response);
		});
		req.on('end', async () => {
			response = compareModels(response.fakeTerm, await getModel(response.modelNumber));
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(response));
			res.end();
		});
	} else if (req.url === '/420getModel420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			response = await getModel(response);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end();
		});
	} else if (req.url === '/420getMFG420') {
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
			let jsonObjectsFile = await fs.promises.readFile(DATABASE_PATH+"/SavedParts.json");
			let jsonObjects = JSON.parse(jsonObjectsFile);
			jsonObjects[response.fields[0]] = response;
			fs.writeFileSync(
				DATABASE_PATH+"/SavedParts.json",
				JSON.stringify(jsonObjects),
				err => {if (err) throw err;}
			);
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
			let jsonObjectsFile = await fs.promises.readFile(DATABASE_PATH+"/SavedParts.json");
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
	} else if (req.url === '/420getPDF420') {
		let response = "";
		req.on('data', async j => {
			response = j.toString('utf8');
		});
		req.on('end', async () => {
			res.writeHead(200, { 'Content-Type': MIME_TYPES['pdf'] });
			let pdfData = await createPdf(response);
			res.write(pdfData);
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

https.createServer(options, fileServ).listen(PORT);

console.log(`Server running at https://127.0.0.1:${PORT}/`);
