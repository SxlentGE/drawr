const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const httpServer = http.createServer(app);
const compression = require("compression");
const { instrument } = require("@socket.io/admin-ui");
const { Server } = require("socket.io");
const { PngImg: PNG } = require("png-img");
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
	points: 5, // 5 points
	duration: 1, // per second
});

const image = new PNG(fs.readFileSync('./image.png'));

const cooldowns = {}

const io = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true
	}
});

instrument(io, {
	auth: {
		"type": "basic",
		"username": "admin",
		"password": "root"
	}
});

app.use(compression());
app.use(express.static(path.join(__dirname, "app")));

app.get("/ping", (req, res) => {
	res.end("Success");
});

io.on("connection", socket => {
	const ip = socket.handshake.address;
	// socket.handshake.headers["x-forwarded-for"]
	socket.on("set", async (x, y, color) => {
		try {
			await rateLimiter.consume(ip);
			
			if (ip in cooldowns) {
				if (cooldowns[ip] > Date.now()) {
					socket.emit("message", {
						"type": "warning",
						"contents": "Please wait for your cooldown to finish."
					});
					return;
				}
				delete cooldowns[ip];
			} else {
				cooldowns[ip] = Date.now() + 1000 * 10;
			}
			io.sockets.emit("set", x, y, color);
			image.set(x, y, color);
			image.save("app/image.png");
		} catch {
			socket.emit("message", {
				"type": "error",
				"contents": "Too many requests, Please try again later."
			})
		}
	});
});

httpServer.listen(443);