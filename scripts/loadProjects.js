import {inferCoverType, createNewProject, enableEditMode, toggleSelectMode, deleteProjects } from "./editProjects.js";
let projectcount = localStorage.getItem("projectcount") ? localStorage.getItem("projectcount") : localStorage.length-2; //global scope var for assigning ids during create
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
const editorTools = editArea.querySelector("editing-tools");
localButton.addEventListener("click", () => {
    // get everything from local storage as an object
    let projectData = getLocalProjects();
    // add editing tools into card gallery
    editorTools.removeAttribute("style");
    populateCardGallery(projectData);
});

const reset = editorTools.querySelector("#reset");
reset.addEventListener("click", async () => {
    Object.keys(localStorage).forEach(key => {
        if (key === "theme" || key === "loaded" || key === "projectcount"){
            return;
        }
        localStorage.removeItem(key);
        projectcount -= 1;
    });
    localStorage.setItem("projectcount", projectcount);
    const loaded = await loadIntoLocal();
    if (loaded) {
        populateCardGallery(getLocalProjects());
    }
});
const createBtn = editorTools.querySelector("#create");
createBtn.addEventListener("click", () => {
    createNewProject();
    // update UI of form to auto select type of local assets if user opts to choose that
    const form = document.getElementById("create-project");
    const coverTypeSelect = form.querySelector("#cover-type");
    const localAssetSelect = form.querySelector("#local-assets");
    localAssetSelect.addEventListener("change", () => {
        const asset = localAssetSelect.value;
        if (asset) {
            const inferred = inferCoverType(asset);
            if (inferred) {
                coverTypeSelect.value = inferred;
            }
        }
    });
});
const selectBtn = editorTools.querySelector("#select");

let selectedIds = [];
let selectMode = false;
const deleteBtn = document.createElement("button");
deleteBtn.setAttribute("id","delete");
deleteBtn.textContent = "delete";
if (selectBtn) {
    selectBtn.addEventListener("click", () => {
        selectMode = toggleSelectMode(selectMode, selectBtn, deleteBtn);
    });
}
if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        const overlays = projectGallery.querySelectorAll("select-overlay");
        // check which ones are selected
        overlays.forEach(overlay => {
            if(overlay.querySelector("input").checked){
                overlay.setAttribute("selected","");
                let id = overlay.querySelector("project-card").getAttribute("data-id");
                selectedIds.push(id);
            }
        });
        alert(`You are deleting ${selectedIds.length}. Proceed?`);
        deleteProjects(selectedIds);
        selectMode = toggleSelectMode(selectMode, selectBtn, deleteBtn);
        populateCardGallery(getLocalProjects());
    });
}
const exitBtn = editorTools.querySelector("#exit");
exitBtn.addEventListener("click", () => {
    selectMode = toggleSelectMode(selectMode, selectBtn, deleteBtn);
});

// load from remote
const remoteButton = document.getElementById("remote");
remoteButton.addEventListener("click", async () => {
    editorTools.setAttribute("style", "display: none;");
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

function getLocalProjects(){
    let projectData = {};
    Object.keys(localStorage).forEach(key => {
        if (key === "theme" || key === "loaded" || key === "projectcount"){
            return;
        }
        projectcount++;
        localStorage.setItem("projectcount", projectcount);
        console.log(key);
        const project = localStorage.getItem(key);
        projectData[key] = JSON.parse(project);
    });
    return projectData;
}
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
        button.disabled = true;
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
// attempting the event bubbling approach
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
        // update UI of form to auto select type of local assets if user opts to choose that
        const form = document.getElementById("edit-data");
        const coverTypeSelect = form.querySelector("#cover-type");
        const localAssetSelect = form.querySelector("#local-assets");
        localAssetSelect.addEventListener("change", () => {
            const asset = localAssetSelect.value;
            if (asset) {
                const inferred = inferCoverType(asset);
                if (inferred) {
                    coverTypeSelect.value = inferred;
                }
            }
        });
    });

    dialog.querySelector('.close').addEventListener('click', () => {
        dialog.close();
    });
    
    dialog.addEventListener('close', function() {
        overlay.remove();
    });
});

export { currentProjects, projectGallery, fillDialogInfo, fillCard};