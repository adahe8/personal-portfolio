import {createNewProject, enableEditMode} from "./editProjects.js";
let projectcount = 0; //global scope var for assigning ids during create
localStorage.setItem("projectcount", projectcount);

const url = `https://api.jsonbin.io/v3/b/69314eb743b1c97be9d70dd3`;
const projectGallery = document.querySelector("projects-gallery");
let currentProjects = {};

// load in projects from local
const localButton = document.getElementById("local");
if (!localStorage.getItem("loaded")) {
    loadIntoLocal();
}
// get editing tools
const editArea = document.getElementById("showcase");
const editTemplate = document.getElementById("editing-buttons");
const editorTools = editTemplate.content.querySelector("editing-tools").cloneNode(true);
localButton.addEventListener("click", () => {
    // get everything from local storage as an object
    let projectData = {};
    Object.keys(localStorage).forEach(key => {
        if (key === "theme" || key === "visited" || key === "projectcount"){
            return;
        }
        projectcount++;
        localStorage.setItem("projectcount", projectcount);
        console.log(key);
        const project = localStorage.getItem(key);
        projectData[key] = JSON.parse(project);
    });
    // add editing tools into card gallery
    if (!editArea.contains(editorTools)){
        editArea.appendChild(editorTools);
    }
    populateCardGallery(projectData);
});
const reset = editorTools.querySelector("#reset");
reset.addEventListener("click", () => {
    loadIntoLocal();
});
const createBtn = editorTools.querySelector("#create");
createBtn.addEventListener("click", () => {
    createNewProject();
});


// load from remote
const remoteButton = document.getElementById("remote");
remoteButton.addEventListener("click", async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const jsonData = await response.json();
        populateCardGallery(jsonData.record);
    } catch (error) {
        console.error(error.message);
    }
});

async function loadIntoLocal(){
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
        if (!localStorage.getItem("visited")){
            localStorage.setItem("loaded", "true");
        }
        return true;
    }catch (error) {
        console.error(error.message);
    }
    return false;
}

function populateCardGallery(projects) {
    if (!projects || typeof projects !== "object") {
        console.error("populateCardGallery called with invalid projects:", projects);
        return;
    }
    currentProjects = projects;
    projectGallery.innerHTML = "";
    Object.keys(projects).forEach(key => {
        const project = projects[key];
        if(!project) {
            console.warn(`null project at ${key}`);
        }
        const card = document.createElement("project-card");
        fillCard(card, project, key);
        projectGallery.appendChild(card);
    });
}
function fillCard(card, project, key) {
    card.setAttribute("data-id", `${key}`);
    card.setAttribute("data-title", `${project.title}`);
    card.setAttribute("data-tags", JSON.stringify(project.tags));
    if (project.deployment) {
        card.setAttribute("data-deploy-link", `${project.deployment}`);
    }
    card.setAttribute("data-cover-type", `${project.coverType}`);
    card.setAttribute("data-srcs", JSON.stringify(project.srcs));
}

function fillDialogInfo(dialog, project){
    //set data attributes to track the project, its tags, and its deployment: important for CRUD
    dialog.setAttribute("data-tags",JSON.stringify(project.tags));
    dialog.querySelector("#todeployment").setAttribute("data-url", project.deployment);
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
}

// populating the dialog box
// attempting the event bubblimg approach
projectGallery.addEventListener('click', e => {
    const card = e.target.closest('project-card');
    if (!card) return; // catch clicks only on project cards

    //grab the project id
    const project = currentProjects[card.dataset.id];
    if (!project) return;

    //clone dialog into DOM, then plug in data
    const template = document.getElementById("project-info");
    const overlay = template.content.querySelector('dialog-overlay').cloneNode(true);
    document.body.appendChild(overlay);
    const dialog = overlay.querySelector('dialog');
    dialog.setAttribute("data-project-id",card.dataset.id); // assign unique id to dialog

    fillDialogInfo(dialog, project);

    dialog.showModal();
    const editButton = document.getElementById("edit");
    editButton.addEventListener("click", () => {
        enableEditMode(dialog, card.dataset.coverType, card.dataset.srcs)
    });

    dialog.querySelector('.close').addEventListener('click', () => {
        dialog.close();
    });
    
    dialog.addEventListener('close', function() {
        overlay.remove();
    });
});

export { currentProjects, projectGallery, fillDialogInfo, fillCard};