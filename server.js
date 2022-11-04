var http=require('http');
var https=require('https');
var fs=require('fs');
var path=require('path');

const PORT=9615;
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
};
const STATIC_PATH = path.join(process.cwd(), './static');
var logStream = fs.createWriteStream(STATIC_PATH + '/log.csv');
const stream = fs.createReadStream('./static/index.html');

const options = {
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem')
};

const toBool = [() => true, () => false];

const getResponse = async (url) => {
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
const postResponse = async (req, res) => {
	logStream.write(req.url.substring(1));
	logStream.write("\n");
	const found = true;
	const ext = 'html';
	return { found, ext, stream };
	//return reqFile(req.url);
};
const fileServ = async (req, res) => {
	const file = req.method === 'POST' ? await postResponse(req, res) : await getResponse(req.url);
	//const file = await prepareResponse(req, res);
	const statusCode = file.found ? 200 : 404;
	const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
	res.writeHead(statusCode, { 'Content-Type': mimeType });
	file.stream.pipe(res);
	console.log(`${req.method} ${req.url} ${statusCode}`);
};

https.createServer(options, fileServ).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);