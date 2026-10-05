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

const scratch = document.getElementById("scratch");

scratch.addEventListener("click", () => {

    scratch.classList.add("revealed");

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
