/* ==========================================
   MOBILE MENU
========================================== */

const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-menu");

menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});



/* ==========================================
   CLOSE MENU AFTER CLICK
========================================== */

document.querySelectorAll(".nav-menu a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

    });

});



/* ==========================================
   ACTIVE NAVIGATION
========================================== */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});



/* ==========================================
   STICKY HEADER SHADOW
========================================== */

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 30) {

        header.style.boxShadow = "0 6px 20px rgba(0,0,0,.08)";

    } else {

        header.style.boxShadow = "none";

    }

});



/* ==========================================
   IMAGE FALLBACK
========================================== */

document.querySelectorAll("img").forEach(image => {

    image.onerror = function () {

        this.src = "images/image-not-available.png";

    };

});


const skillsGrid = document.querySelector(".skills-grid");

document.querySelector(".skill-next").onclick = () => {

    skillsGrid.scrollBy({

        left:300,

        behavior:"smooth"

    });

};

document.querySelector(".skill-prev").onclick = () => {

    skillsGrid.scrollBy({

        left:-300,

        behavior:"smooth"

    });

};