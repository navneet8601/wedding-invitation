/* =========================================
   OPEN INVITATION
========================================= */

const opening = document.getElementById("opening");
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicButton");


opening.addEventListener("click", async () => {

    opening.classList.add("hide");

    try {

        await music.play();

        musicButton.classList.add("playing");

    } catch (error) {

        console.log("Music requires user interaction.");

    }

});


/* =========================================
   MUSIC
========================================= */

musicButton.addEventListener("click", async (event) => {

    event.stopPropagation();

    if (music.paused) {

        await music.play();

        musicButton.innerHTML = "♫";

    } else {

        music.pause();

        musicButton.innerHTML = "🔇";

    }

});


/* =========================================
   SCRATCH DATE
========================================= */

const scratchCanvas = document.getElementById("scratch");
const scratchCtx = scratchCanvas.getContext("2d", {
    willReadFrequently: true
});

let scratching = false;
let scratchCleared = false;
let scratchMoves = 0;
let lastPoint = null;

const scratchBrush = 28;


function paintScratchCoat() {

    if (scratchCleared || scratchMoves > 0) {
        return;
    }

    const rect = scratchCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;

    scratchCanvas.width = Math.round(width * dpr);
    scratchCanvas.height = Math.round(height * dpr);

    scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.clearRect(0, 0, width, height);

    const gradient = scratchCtx.createLinearGradient(
        0,
        0,
        width,
        height
    );

    gradient.addColorStop(0, "#e7d3b4");
    gradient.addColorStop(0.28, "#f8efe2");
    gradient.addColorStop(0.55, "#d4b07a");
    gradient.addColorStop(1, "#c49a58");

    scratchCtx.fillStyle = gradient;
    scratchCtx.fillRect(0, 0, width, height);

    scratchCtx.save();
    scratchCtx.globalAlpha = 0.35;
    scratchCtx.strokeStyle = "#fffaf4";
    scratchCtx.lineWidth = 1;

    for (let y = 2; y < height; y += 3) {

        scratchCtx.beginPath();
        scratchCtx.moveTo(0, y);
        scratchCtx.lineTo(width, y);
        scratchCtx.stroke();

    }

    scratchCtx.restore();

    for (let i = 0; i < 36; i++) {

        scratchCtx.fillStyle =
            "rgba(255, 250, 244, "
            + (0.15 + Math.random() * 0.4)
            + ")";

        scratchCtx.beginPath();
        scratchCtx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 1.5,
            0,
            Math.PI * 2
        );
        scratchCtx.fill();

    }

    scratchCtx.strokeStyle = "rgba(143, 109, 56, 0.28)";
    scratchCtx.lineWidth = 1;
    scratchCtx.strokeRect(10, 10, width - 20, height - 20);

    scratchCtx.fillStyle = "#8f6d38";
    scratchCtx.textAlign = "center";
    scratchCtx.textBaseline = "middle";
    scratchCtx.font = "34px 'Great Vibes', cursive";
    scratchCtx.fillText("Scratch", width / 2, height / 2 - 2);

}


function scratchPoint(event) {

    const rect = scratchCanvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

}


function eraseStroke(from, to) {

    scratchCtx.save();
    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.lineCap = "round";
    scratchCtx.lineJoin = "round";
    scratchCtx.lineWidth = scratchBrush;
    scratchCtx.strokeStyle = "#000";
    scratchCtx.beginPath();
    scratchCtx.moveTo(from.x, from.y);
    scratchCtx.lineTo(to.x, to.y);
    scratchCtx.stroke();

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(distance / 5));

    scratchCtx.fillStyle = "#000";

    for (let i = 0; i <= steps; i++) {

        const t = i / steps;
        const radius = scratchBrush * (0.16 + Math.random() * 0.22);

        scratchCtx.beginPath();
        scratchCtx.arc(
            from.x + dx * t + (Math.random() - 0.5) * 10,
            from.y + dy * t + (Math.random() - 0.5) * 10,
            radius,
            0,
            Math.PI * 2
        );
        scratchCtx.fill();

    }

    scratchCtx.restore();

}


function scratchedAmount() {

    const { data } = scratchCtx.getImageData(
        0,
        0,
        scratchCanvas.width,
        scratchCanvas.height
    );

    let clear = 0;
    let total = 0;

    for (let i = 3; i < data.length; i += 32) {

        total += 1;

        if (data[i] < 32) {
            clear += 1;
        }

    }

    return total === 0 ? 0 : clear / total;

}


function finishScratch() {

    if (scratchCleared) {
        return;
    }

    scratchCleared = true;
    scratching = false;
    scratchCanvas.classList.add("cleared");

}


function maybeFinishScratch() {

    if (!scratchCleared && scratchedAmount() > 0.5) {
        finishScratch();
    }

}


scratchCanvas.addEventListener("pointerdown", (event) => {

    if (scratchCleared) {
        return;
    }

    event.preventDefault();
    scratching = true;
    scratchMoves += 1;
    scratchCanvas.setPointerCapture(event.pointerId);
    lastPoint = scratchPoint(event);
    eraseStroke(lastPoint, lastPoint);

});


scratchCanvas.addEventListener("pointermove", (event) => {

    if (!scratching || scratchCleared) {
        return;
    }

    const point = scratchPoint(event);

    eraseStroke(lastPoint, point);
    lastPoint = point;
    scratchMoves += 1;

    if (scratchMoves % 6 === 0) {
        maybeFinishScratch();
    }

});


function endScratch() {

    if (!scratching) {
        return;
    }

    scratching = false;
    lastPoint = null;
    maybeFinishScratch();

}


scratchCanvas.addEventListener("pointerup", endScratch);
scratchCanvas.addEventListener("pointercancel", endScratch);

scratchCanvas.addEventListener("contextmenu", (event) => {

    event.preventDefault();

});


new ResizeObserver(() => {

    paintScratchCoat();

}).observe(scratchCanvas);


document.fonts.ready.then(() => {

    paintScratchCoat();

});


/* =========================================
   SCROLL ANIMATIONS
========================================= */

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {
        threshold: 0.15
    }

);


document
    .querySelectorAll(".reveal")
    .forEach((element) => {

        observer.observe(element);

    });


/* =========================================
   GOOGLE MAPS
========================================= */

function openMaps() {

    const address =
        "Luv Kush Vatika, Kanpur, India";

    const url =
        "https://www.google.com/maps/search/?api=1&query="
        + encodeURIComponent(address);

    window.open(url, "_blank");

}


/* =========================================
   RSVP
========================================= */

function rsvp() {

    const phoneNumber = "918601890804";

    const message =
        "Hello! I would like to confirm my attendance for the wedding of Navneet & Deepali.";

    const url =
        "https://wa.me/"
        + phoneNumber
        + "?text="
        + encodeURIComponent(message);

    window.open(url, "_blank");

}
