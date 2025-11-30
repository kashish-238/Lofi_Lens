/* ============================================================
   LOFI LENS — CLEAN SCRIPT (NO GRAIN)
   Aesthetic Polaroid + Jennie Film Contact Sheet
============================================================ */

// === DOM ELEMENTS ===
const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const downloadBtn = document.getElementById("download-btn");
const flash = document.getElementById("flash");
const countdown = document.getElementById("countdown");
const gallery = document.getElementById("gallery");
const styleSelect = document.getElementById("download-style");
const photoCountSelect = document.getElementById("photo-count");
const delaySelect = document.getElementById("delay");
const filterButtons = document.querySelectorAll(".filter-btn");

// Audio
const audio = document.getElementById("lofi-audio");
const playBtn = document.getElementById("audio-play");
const muteBtn = document.getElementById("audio-toggle");

let capturedImages = [];
let currentFilter = "none";

/* ============================================================
   START CAMERA
============================================================ */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    await new Promise((res) => {
      video.onloadedmetadata = () => {
        video.play();
        res();
      };
    });
  } catch (err) {
    alert("Camera blocked or missing.");
    console.error(err);
  }
}
document.addEventListener("DOMContentLoaded", startCamera);

/* ============================================================
   FLASH
============================================================ */
function doFlash() {
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 200);
}

/* ============================================================
   COUNTDOWN
============================================================ */
function runCountdown(seconds) {
  return new Promise((resolve) => {
    if (seconds <= 0) return resolve();
    let count = seconds;
    countdown.textContent = count;
    countdown.classList.add("show");

    const timer = setInterval(() => {
      count--;
      if (count > 0) countdown.textContent = count;
      else {
        clearInterval(timer);
        countdown.classList.remove("show");
        countdown.textContent = "";
        resolve();
      }
    }, 1000);
  });
}

/* ============================================================
   FILTERS
============================================================ */
function getCanvasFilter(name) {
  switch (name) {
    case "rose-blush": return "brightness(1.1) saturate(1.2) hue-rotate(-10deg)";
    case "honey-warm": return "sepia(0.45) contrast(1.15)";
    case "faded-film": return "grayscale(0.25) brightness(1.1)";
    case "matte-vintage": return "contrast(0.85) sepia(0.35)";
    case "cream-soft": return "brightness(1.15) blur(1px)";
    case "mocha-glow": return "sepia(0.6) brightness(1.1)";
    case "bw-classic": return "grayscale(1)";
    case "retro-glitch": return "contrast(1.3) hue-rotate(180deg)";
    case "flip-phone": return "contrast(0.9) saturate(0.7) brightness(1.2)";
    default: return "none";
  }
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    video.style.filter = getCanvasFilter(currentFilter);

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ============================================================
   UPLOAD PHOTO
============================================================ */
document.getElementById("upload-btn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    const img = new Image();
    img.src = URL.createObjectURL(input.files[0]);

    const wrapper = makePhotoWrapper(img);
    gallery.appendChild(wrapper);
    capturedImages.push(wrapper);
  };

  input.click();
});

/* ============================================================
   TAKE PHOTO
============================================================ */
captureBtn.addEventListener("click", async () => {
  if (!video.srcObject) return alert("Camera not ready.");

  const delay = parseInt(delaySelect.value);
  const maxPhotos = parseInt(photoCountSelect.value);

  if (capturedImages.length >= maxPhotos)
    return alert(`Limit reached: ${maxPhotos} photos.`);

  await runCountdown(delay);
  doFlash();

  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");

  ctx.filter = getCanvasFilter(currentFilter);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const wrapper = makePhotoWrapper(canvas);
  gallery.appendChild(wrapper);
  capturedImages.push(wrapper);
});

/* ============================================================
   CREATE GALLERY WRAPPER
============================================================ */
function makePhotoWrapper(contentCanvasOrImg) {
  const wrapper = document.createElement("div");
  wrapper.className = "photo-wrapper";

  wrapper.canvasRef = contentCanvasOrImg;

  const display = document.createElement("img");
  display.src = contentCanvasOrImg.toDataURL
    ? contentCanvasOrImg.toDataURL()
    : contentCanvasOrImg.src;
  display.className = "captured-photo";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✖";
  deleteBtn.onclick = () => {
    wrapper.remove();
    capturedImages = capturedImages.filter((w) => w !== wrapper);
  };

  wrapper.appendChild(display);
  wrapper.appendChild(deleteBtn);
  return wrapper;
}

/* ============================================================
   DOWNLOAD — POLAROID & JENNIE FILM SHEET
============================================================ */
downloadBtn.addEventListener("click", () => {
  if (capturedImages.length === 0)
    return alert("No photos yet.");

  const style = styleSelect.value;

  const photoW = 300;
  const photoH = 200;

  const spacing = 10;
  const polaroidH = photoH + 22 + 68;
  const filmH = photoH + 85;

  let perH =
    style === "polaroid"
      ? polaroidH
      : style === "film"
      ? filmH
      : photoH;

  const totalH =
    capturedImages.length * perH +
    (capturedImages.length - 1) * spacing;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = photoW;
  outCanvas.height = totalH;

  const ctx = outCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

  let offsetY = 0;

  capturedImages.forEach((wrapper, index) => {
    const img = wrapper.canvasRef;

    if (style === "none") {
      ctx.drawImage(img, 0, offsetY, photoW, photoH);
      offsetY += photoH + spacing;
    } else if (style === "polaroid") {
      const top = 22, side = 22, bottom = 68;
      ctx.fillStyle = "#f7f7f2";
      ctx.fillRect(0, offsetY, photoW, polaroidH);
      ctx.drawImage(img, side, offsetY + top, photoW - side * 2, photoH);
      offsetY += polaroidH + spacing;
    } else if (style === "film") {
      const frameH = filmH;
      const border = 4;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, offsetY, photoW, frameH);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = border;
      ctx.strokeRect(border, offsetY + border + 10, photoW - border * 2, photoH - 2);
      ctx.drawImage(img, border + 2, offsetY + border + 12, photoW - (border + 2) * 2, photoH - 6);
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.font = "16px 'Space Mono', monospace";
      ctx.translate(20, offsetY + frameH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("KODAK 400", 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(photoW - 20, offsetY + frameH / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText("KODAK PORTRA FF 1 2010TX", 0, 0);
      ctx.restore();
      ctx.fillStyle = "#000";
      ctx.font = "18px 'Space Mono', monospace";
      ctx.fillText((index + 1) * 11, photoW - 45, offsetY + 18);
      ctx.font = "20px 'Space Mono', monospace";
      ctx.fillText("▲", photoW - 20,       offsetY += frameH + spacing);
    }
  });

  const link = document.createElement("a");
  link.href = outCanvas.toDataURL("image/png");
  link.download = "lofi-strip.png";
  link.click();
});

/* ============================================================
   AUDIO CONTROLS
============================================================ */
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸ Pause Music";
  } else {
    audio.pause();
    playBtn.textContent = "▶️ Play Music";
  }
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? "🔇 Unmute" : "🔈 Mute";
});

/* ============================================================
   THEME TOGGLE — LIGHT / DARK (Slider)
============================================================ */
const themeToggle = document.getElementById("theme-toggle");
const toggleIcon = document.querySelector(".toggle-icon");

// Load saved preference
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  themeToggle.checked = true;
  toggleIcon.textContent = "☀️";
} else {
  themeToggle.checked = false;
  toggleIcon.textContent = "🌙";
}

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    toggleIcon.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    toggleIcon.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
});
