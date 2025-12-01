const btn = document.querySelector(".toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const label = document.getElementById("theme-label");
updateIconsAndButtons();
btn.style.display = "block";

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

// populating the dialog box
const template = document.querySelector("template");
const projectGallery = document.getElementById("projects-main");
// fetch data
fetch('/projectdata.json')
  .then(response => response.json())
  .then(data => {
    projectGallery.addEventListener('click', e => {
      const card = e.target.closest('project-card');
      if (!card) return; // catch clicks only on project cards

      //grab the project id
      const project = data[card.dataset.projectName];
      if (!project) return;

      //clone dialog into DOM, then plug in data
      const overlay = template.content.querySelector('dialog-overlay').cloneNode(true);
      document.body.appendChild(overlay);

      const dialog = overlay.shadowRoot
      ? overlay.shadowRoot.querySelector('dialog')
      : overlay.querySelector('dialog');


      dialog.querySelector('h2').textContent = project.title;
      dialog.querySelector('h3').textContent = project.date;
      const marqueeSection = dialog.querySelector('#marquee-content');
      marqueeSection.textContent = "";
      project.tools.forEach(item => {
        const span = document.createElement('span');
        span.textContent = item;
        marqueeSection.appendChild(span);
      });
      const button = dialog.querySelector('#todeployment');
      if (project.deployment != "") {
        button.textContent = "View Project!";
        button.addEventListener('click', () => {
          window.open(project.deployment, '_blank');
        });
      } else {
        button.style.backgroundColor = "var(--background)";
        button.textContent = "Not yet deployed";
      }
      if (project.articleHeader != "") {
        dialog.querySelector('article h3').textContent = project.articleHeader;
      } else {
        dialog.querySelector('article h3').style.display = "none";
      }
      const blogBody = dialog.querySelector('article');
      project.description.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        blogBody.appendChild(p);
      });

      dialog.showModal();

      dialog.querySelector('#close').addEventListener('click', () => {
        dialog.close();
      });
      
      dialog.addEventListener('close', function() {
        overlay.remove();
      });
    });
  })