const btn = document.querySelector(".toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const label = document.getElementById("theme-label");
updateIconsAndButtons();
btn.style.display = "block";

label.textContent = prefersDarkScheme == "dark" ? "to Light Theme" : "to Dark Theme";

const defaultTheme = localStorage.getItem("theme");
if (defaultTheme == "dark") {
  document.body.classList.toggle("dark-theme");
  label.textContent = " to Light Theme";
} else if (defaultTheme == "light") {
  document.body.classList.toggle("light-theme");
  label.textContent = " to Dark Theme";
}

btn.addEventListener("click", function () {
  console.log("clicked!");
  let theme;
  if (prefersDarkScheme.matches) {
    document.body.classList.toggle("light-theme");
    theme = document.body.classList.contains("light-theme") ? "light" : "dark";
  } else {
    document.body.classList.toggle("dark-theme");
    theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  }
  localStorage.setItem("theme", theme);
  updateIconsAndButtons();
});

function updateIconsAndButtons() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    label.textContent = " to Light Theme";
    document.querySelector("nav img").src = "assets/logo-darktheme.png";
    document.querySelector("footer a img").src = "assets/linkedin-black.png";
  } else {
    label.textContent = " to Dark Theme";
    document.querySelector("nav img").src = "assets/logo.png";
    document.querySelector("footer a img").src = "assets/linkedin-white.png";
  }
}