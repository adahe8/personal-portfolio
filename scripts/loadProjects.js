import {enableEditMode} from "./editProjects.js";

const url = `https://api.jsonbin.io/v3/b/69314eb743b1c97be9d70dd3`;

const projectGallery = document.getElementById("projects-gallery");
// load from local
const localButton = document.getElementById("local");
if (!localStorage.getItem("visited")) {
    console.log("Projects data is not in local storage: if there is network, JSON data will populate it.");
    async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            let jsonData = await response.json();
            let objects = jsonData.record;
            Object.keys(objects).forEach(key => {
                console.log(key);
                localStorage.setItem(key, JSON.stringify(objects[key]));
            });
        }catch (error) {
            console.error(error.message);
            projectGallery.innerHTML = "No network, and no data to fetch from local storage. Projects cannot be shown.";
        }
    }
    localStorage.setItem("visited", "true");
}

localButton.addEventListener("click", () => {
    // get everything from local storage as an object
    let projectData = {};
    Object.keys(localStorage).forEach(key => {
        if (key === "theme" || key === "visited"){
            return;
        }
        console.log(key);
        const project = localStorage.getItem(key);
        projectData[key] = JSON.parse(project);
    });
    populateCardGallery(projectData);
    populateDialog(projectData);
});


// load from remote
let projects = {};
const remoteButton = document.getElementById("remote");

remoteButton.addEventListener("click", async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const jsonData = await response.json();
        populateCardGallery(jsonData.record);
        populateDialog(jsonData.record);
    } catch (error) {
        console.error(error.message);
    }
});

function populateCardGallery(projects) {
    projectGallery.innerHTML = "";
    Object.keys(projects).forEach(key => {
        const project = projects[key];
        const card = document.createElement("project-card");
        card.setAttribute("data-id", `${key}`);
        card.setAttribute("data-title", `${project.title}`);
        card.setAttribute("data-tags", JSON.stringify(project.tags));
        if (project.deployment) {
            card.setAttribute("data-deploy-link", `${project.deployment}`);
        }
        card.setAttribute("data-cover-type", `${project.coverType}`);
        card.setAttribute("data-srcs", JSON.stringify(project.srcs));
        projectGallery.appendChild(card);
    });

}

function populateDialog(projects) {
    // populating the dialog box
    // attempting the event bubblimg approach
    projectGallery.addEventListener('click', e => {
        const card = e.target.closest('project-card');
        if (!card) return; // catch clicks only on project cards

        //grab the project id
        const project = projects[card.dataset.id];
        if (!project) return;

        //clone dialog into DOM, then plug in data
        const template = document.querySelector("template");
        const overlay = template.content.querySelector('dialog-overlay').cloneNode(true);
        document.body.appendChild(overlay);

        const dialog = overlay.querySelector('dialog');

        //set data attributes to track which project and its tags are showing: important for CRUD
        dialog.setAttribute("data-project-id",card.dataset.id);
        console.log();
        dialog.setAttribute("data-tags",JSON.stringify(project.tags));
        
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
            button.setAttribute("data-url",`${project.deployment}`);
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
        enableEditMode(dialog);

        dialog.querySelector('#close').addEventListener('click', () => {
            dialog.close();
        });
        
        dialog.addEventListener('close', function() {
            overlay.remove();
        });
    });
}

