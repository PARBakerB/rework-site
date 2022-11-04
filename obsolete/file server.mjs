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


const reqFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith('/')) paths.push('index.html');
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  
  if (url.startsWith("/?")) {
    console.log("frog");
	new Promise((resolve, reject) => {
		resolve(makeConnection("Read",['M9100-11']).connect())
	}).then(console.log(connectionReport()));
	//await makeConnection("Read",['M9100-11']).connect();
	//console.log(connectionReport());
  }
  
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
}
const prepareResponse = async (url) => {
  return reqFile(url);
};
const fileServ = async (req, res) => {
  const file = await prepareResponse(req.url);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { 'Content-Type': mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);
  fs.writeFileSync('static/res.json', JSON.stringify(connectionReport()));
};

http.createServer(fileServ).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);