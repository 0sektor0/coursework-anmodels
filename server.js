exports.HandleRequest = HandleRequest;

const debug = require("debug");
const http = require("http");
const fs = require("fs");

const port = 3000;
const log = debug("*");
const root = "./static";
const index = "/html/index.html";
const notfoundPage = "/html/404.html";
const fileNotFindErrorCode = -2;

function HandleRequest(req, res) {
	log("request: %s", req.url);

	const requestedFilePath =
		req.url == "/" ? `${root}/${index}` : `${root}${req.url}`;
	let fileContents;

	try {
		fileContents = fs.readFileSync(requestedFilePath);
	} catch (err) {
		switch (err.errno) {
			case fileNotFindErrorCode:
				fileContents = fs.readFileSync(root + notfoundPage);
				res.statusCode = 404;
				break;

			default:
				res.statusCode = 400;
				fileContents = err.message;
				break;
		}

		log("error: %s", err.message);
	}

	res.write(fileContents);
	res.end();
}

const server = http.createServer(HandleRequest);

server.listen(port, () => {
	log("server started on port %s", port);
});
