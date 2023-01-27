Math.clamp = ((e, t, n) => e > n ? n : e < t ? t : e);

const $ = s => document.querySelector(s);

const hasMouse = matchMedia('(pointer:fine)').matches;
const socket = io();
const canvas = $("#canvas");
const graphics = canvas.getContext("2d");
const LS = localStorage;

let color = "#000000";

let x = 0,
	y = 0;

const setIntervalExecute = (callback, time) => {
	callback();
	return setInterval(callback, time);
};

const cooldown = check => {
	if (!LS.cooldown) {
		if (check) {
			$("#cooldown").innerText = "0:00";
			return;
		} else {
			LS.cooldown = Date.now() + 1000 * 2; 
		}
	}
	
	let cooldownDate = new Date(+LS.cooldown);
	let id = setIntervalExecute(() => {
		const now = new Date();

		const nowSeconds = now.getMinutes() * 60 + now.getSeconds();
		const endSeconds = cooldownDate.getMinutes() * 60 + cooldownDate.getSeconds();
		
		const secs = (endSeconds - nowSeconds) % 60;
    	const mins = (endSeconds - nowSeconds) / 60 | 0;
		
		if (mins === 0 && secs === 0) {
			$("#cooldown").innerText = "0:00";
			delete LS.cooldown;
			clearInterval(id);
			return;
		}
		
		const timeString = `${mins}:${(secs + '').padStart(2, "0")}`;

		$("#cooldown").innerText = timeString;
	}, 1000);
};

const movePixel = (pX, pY) => {
	const rect = canvas.getBoundingClientRect();
	const scale = $("pinch-zoom").scale;

	const rX = Math.floor((pX - rect.x) / scale);
	const rY = Math.floor((pY - rect.y) / scale);

	x = Math.clamp(rX, 0, canvas.width - 1);
	y = Math.clamp(rY, 0, canvas.height - 1);

	$("#pixel").style.left = x * scale + rect.x;
	$("#pixel").style.top = y * scale + rect.y;

	$("#pixel").style.width = $("#pixel").style.height = scale;

	$("#coordinates").innerText = `(${x}, ${y}) ${scale.toFixed(2)}x`;
};

const message = json => {
	const type = json.type;
	let className;
	if (type === "error") {
		className = "error";
	} else if (type === "warning") {
		className = "warn";
	}

	const li = document.createElement("li");
	li.innerText = json.contents;

	li.classList.add(className);

	$("#messages").appendChild(li);

	setTimeout(() => li.remove(), 1000 * 3);
};

const flashTime = () => {
	$("#cooldown").classList.remove("flash");
	setTimeout(() => {
		$("#cooldown").classList.add("flash");
	}, 1);
};

const set = (x, y, color) => {
	graphics.fillStyle = color;
	graphics.fillRect(x, y, 1, 1);
};

const rescale = () => {
	const scale = Math.min(window.innerWidth / canvas.width, window.innerHeight / canvas.height) / 1.5;

	$("pinch-zoom").setTransform({
		scale: scale,
		x: (window.innerWidth - (canvas.width * scale)) / 2,
		y: (window.innerHeight - (canvas.height * scale)) / 2
	});

	$("#coordinates").innerText = `(${x}, ${y}) ${scale.toFixed(2)}x`;
};

window.addEventListener("resize", () => {
	rescale();
});

window.addEventListener("load", () => {
	cooldown(true);
	$("#colorPicker").addEventListener("input", ({
		target: {
			value
		}
	}) => {
		color = value;
	});
	if (hasMouse) {
		canvas.addEventListener("mousemove", e => {
			movePixel(e.pageX, e.pageY);
		});

		$("pinch-zoom").addEventListener("change", () => {
			const scale = $("pinch-zoom").scale;
			const rect = canvas.getBoundingClientRect();

			$("#pixel").style.left = x * scale + rect.left;
			$("#pixel").style.top = y * scale + rect.top;

			$("#pixel").style.width = scale;
			$("#pixel").style.height = scale;

			$("#coordinates").innerText = `(${x}, ${y}) ${scale.toFixed(2)}x`;
		});

		$("pinch-zoom").addEventListener("click", e => {
			const rect = canvas.getBoundingClientRect();

			if (e.pageX >= rect.x && e.pageX <= rect.x + rect.width && e.pageY >= rect.top && e.pageY <= rect.top + rect.height) {
				if (LS.cooldown) {
				 	flashTime();
				 	return;
				}
				cooldown();
				set(x, y, color);
				socket.emit("set", x, y, color);
			}
		});
	} else {
		$("pinch-zoom").addEventListener("change", () => {
			movePixel(window.innerWidth / 2, window.innerHeight / 2);
		});

		$("pinch-zoom").addEventListener("click", () => {
			if (LS.cooldown) {
				flashTime();
				return;
			}
			cooldown();
			set(x, y, color);
			socket.emit("set", x, y, color);
		});
	}
	const image = new Image();

	image.onload = () => {
		canvas.width = image.width;
		canvas.height = image.height;

		graphics.imageSmoothingEnabled = false;

		graphics.drawImage(image, 0, 0);

		rescale();
	};

	image.src = "./image.png";

	socket.on("set", (x, y, color) => {
		set(x, y, color);
	});

	socket.on("message", message);
});
