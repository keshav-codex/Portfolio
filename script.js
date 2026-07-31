/* ==========================================
   ELEMENTS
========================================== */

const header = document.querySelector(".header");

const menuBtn = document.querySelector(".menu-btn");

const navMenu = document.querySelector(".nav-menu");

const navLinks = document.querySelectorAll(".nav-menu a");

const sections = document.querySelectorAll("section");

const skillsGrid = document.querySelector(".skills-grid");

const nextSkillBtn = document.querySelector(".skill-next");

const prevSkillBtn = document.querySelector(".skill-prev");


/* ==========================================
   MOBILE MENU
========================================== */

if(menuBtn && navMenu){

    menuBtn.addEventListener("click",function(){

        navMenu.classList.toggle("active");

        menuBtn.classList.toggle("active");

        menuBtn.setAttribute(
            "aria-expanded",
            navMenu.classList.contains("active")
        );

    });

}


/* ==========================================
   CLOSE MENU AFTER LINK CLICK
========================================== */

navLinks.forEach(function(link){

    link.addEventListener("click",function(event){

        event.preventDefault();

        const target = document.querySelector(
            this.getAttribute("href")
        );

        if(target){

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        }

        if(navMenu){

            navMenu.classList.remove("active");

        }

        if(menuBtn){

            menuBtn.classList.remove("active");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

});


/* ==========================================
   CLOSE MENU WHEN CLICKING OUTSIDE
========================================== */

document.addEventListener("click",function(event){

    if(
        navMenu &&
        menuBtn &&
        navMenu.classList.contains("active") &&
        !navMenu.contains(event.target) &&
        !menuBtn.contains(event.target)
    ){

        navMenu.classList.remove("active");

        menuBtn.classList.remove("active");

        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

    }

});


/* ==========================================
   CLOSE MENU WITH ESC KEY
========================================== */

document.addEventListener("keydown",function(event){

    if(
        event.key === "Escape" &&
        navMenu &&
        navMenu.classList.contains("active")
    ){

        navMenu.classList.remove("active");

        menuBtn.classList.remove("active");

        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

    }

});


/* ==========================================
   ACTIVE NAVIGATION
========================================== */

function updateActiveSection(){

    let currentSection = "";

    sections.forEach(function(section){

        const sectionTop =
        section.offsetTop - 140;

        const sectionBottom =
        sectionTop + section.offsetHeight;

        if(

            window.scrollY >= sectionTop &&
            window.scrollY < sectionBottom

        ){

            currentSection = section.id;

        }

    });

    navLinks.forEach(function(link){

        link.classList.remove("active");

        if(

            link.getAttribute("href") ===
            "#" + currentSection

        ){

            link.classList.add("active");

        }

    });

}


/* ==========================================
   HEADER SHADOW
========================================== */

function updateHeader(){

    if(!header){

        return;

    }

    if(window.scrollY > 20){

        header.style.boxShadow =
        "0 6px 20px rgba(0,0,0,.08)";

    }

    else{

        header.style.boxShadow = "none";

    }

}


/* ==========================================
   WINDOW SCROLL
========================================== */

window.addEventListener("scroll",function(){

    updateHeader();

    updateActiveSection();

});


/* ==========================================
   IMAGE FALLBACK
========================================== */

document.querySelectorAll("img").forEach(function(image){

    image.addEventListener("error",function(){

        this.src =
        "images/image-not-available.png";

    });

});


/* ==========================================
   SKILLS SLIDER
========================================== */

function scrollSkills(direction){

    if(!skillsGrid){

        return;

    }

    const scrollAmount =

    Math.min(

        skillsGrid.clientWidth * 0.8,

        350

    );

    skillsGrid.scrollBy({

        left:direction * scrollAmount,

        behavior:"smooth"

    });

}


if(nextSkillBtn){

    nextSkillBtn.addEventListener("click",function(){

        scrollSkills(1);

    });

}


if(prevSkillBtn){

    prevSkillBtn.addEventListener("click",function(){

        scrollSkills(-1);

    });

}


/* ==========================================
   INITIAL LOAD
========================================== */

window.addEventListener("load",function(){

    updateHeader();

    updateActiveSection();

});