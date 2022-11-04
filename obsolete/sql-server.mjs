import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import sql_conn from './sql_connect.js';
import sql_out from './sql_connect.js';
var {makeConnection}=sql_conn;
var {connectionReport}=sql_out;

const PORT=9615;
const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  json: 'application/json',
  mjs: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};
const STATIC_PATH = path.join(process.cwd(), './static');

const toBool = [() => true, () => false];

const updateJson = async () => {
	var jsondat = await connectionReport();
	fs.writeFile('./static/res.json', JSON.stringify(jsondat), function (err) {
		if (err) return console.log(err);
	});
};
const reqFile = async (url) => {
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
};
const prepareResponse = async (req) => {
	let url = req.url;
	if ( url[1] === "?") { //url === '/action_page_binary.asp'
		let url_args = url.substring(1).split("&");
		let values = [];
		url_args.forEach(j => {values.push(j.substring(j.indexOf("=")+1))});
		makeConnection("Read",values).connect();
		updateJson();
		
		const found = true;
		const ext = 'html';
		const stream = fs.createReadStream('./static/index.html');
		return { found, ext, stream };
	}
	
	return reqFile(req.url);
};
const fileServ = async (req, res) => {
	const file = await prepareResponse(req);
	const statusCode = file.found ? 200 : 404;
	const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
	res.writeHead(statusCode, { 'Content-Type': mimeType });
	file.stream.pipe(res);
	console.log(`${req.method} ${req.url} ${statusCode}`);
};

http.createServer(fileServ).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);