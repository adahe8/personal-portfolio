import { currentProjects, projectGallery, fillCard, fillDialogInfo } from "./loadProjects.js";  

function buildProjectForm({
    title = "",
    date = "",
    tags = [],
    tools = [],
    deployment = "",
    articleHeader = "",
    description = ""
} = {}, allTags = ["ai", "design", "frontend", "fullstack", "backend", "other"]) {
    const tagSelect = allTags.map(tag =>
        `<option value="${tag}"${tags.includes(tag)?" selected" : ""}>${tag}</option>`
    ).join("");
    return `
        <label for="title">Project title.</label>
        <input id="title" type="text" value="${title}" />
        <label for="date">Span of time the project was worked on.</label>
        <input id="date" type="text" value="${date}" />
        <marquee-container>
            <p>Tech Stack</p>
            <input id="tools" type="text" value="${tools}" />
        </marquee-container>
        <label for="deployment">Link to project deployment.</label>
        <input id="deployment" type="url" value="${deployment}" />
        <label for="article-header">A fun title for the project reflection.</label>
        <input id="article-header" type="text" value="${articleHeader}" />
        <label for="description">Project description.</label>
        <textarea id="description" rows=21>${description}</textarea>
        <label for="tags">Select the project topics.</label>
        <select id="tags" multiple>${tagSelect}</select>
        <label for="cover">Upload a image or video to change the project cover.</label>
        <input id="cover" type="file" accept="image/*, video/*"/>
        <button type="submit">Save</button>
    `;
}
function dialogHandling(dialog, original=null) {
    const close = dialog.querySelector(".close");
    if(close) {
        close.addEventListener("click", () => {
            dialog.close();
        })
    }
    const cancel =  dialog.querySelector("#cancel");
    if (cancel && original) {
        cancel.addEventListener("click", () => {
            dialog.replaceWith(original);
        });
    }
    dialog.addEventListener("close", () => {
        dialog.parentNode.remove();
    });
}
function handleCoverUpload(fileInput, project, callback){
    if (fileInput && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
            project["srcs"] = [event.target.result];
            const uploadType = fileInput.files[0].type;
            project["coverType"] = uploadType.includes("image") ? "image" : "video";
            callback();
        };
        reader.readAsDataURL(fileInput.files[0]);
    }else{
        callback();
    }
}

function createNewProject(){
    const createDialog = document.createElement("dialog");
    const overlay = document.createElement("dialog-overlay");
    overlay.appendChild(createDialog);
    createDialog.innerHTML = `
        <button class="close">x</button>
        <form id="create-project">${buildProjectForm()}</form>
    `;
    document.body.append(overlay);
    createDialog.showModal();

    const form = createDialog.querySelector("#create-project");
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // hi browser, I will now write my own JS handling

        const newProj = {
            title: form.querySelector("#title").value,
            date: form.querySelector("#date").value,
            tags: Array.from(form.querySelector('select').selectedOptions).map(opt => opt.value),
            tools: form.querySelector("#tools").value.split(",").map(tool => tool.trim()),
            deployment: form.querySelector("#deployment").value,
            coverType: "",
            srcs: [],
            articleHeader: form.querySelector("#article-header").value,
            description: form.querySelector('textarea').value.split("\n"),
        };

        const fileInput = form.querySelector("#cover");
        handleCoverUpload(fileInput, newProj, () => {
            let projectcount = localStorage.getItem("projectcount");
            const newId = `p${projectcount}`;
            localStorage.setItem(newId, JSON.stringify(newProj));
            currentProjects[newId] = newProj;
            const card = document.createElement("project-card");
            fillCard(card, newProj, newId);
            projectGallery.appendChild(card);
            createDialog.close();
        });
        projectcount++;
        localStorage.setItem("projectcount", projectcount);
    });
    dialogHandling(createDialog);
}

function enableEditMode(dialogBox, oldCoverType, oldSrcs) {
    const summaryContent = dialogBox.querySelector("article");
    const projectId = dialogBox.dataset.projectId;

    // switch inside of dialog to form for editing mode (use CSS to make this look how the dialog currently looks)
    // TODO: show some other indicator (maybe a little css fade-in message to tell user that they're in edit mode)
    let oldDescription = Array.from(summaryContent.querySelectorAll("p"))
        .map(p => p.textContent).join("\n");
    const button = dialogBox.querySelector("#todeployment");
    const oldUrl = button.dataset.url ? `${button.dataset.url}` : "";
    let oldTools = Array.from(dialogBox.querySelectorAll("span"))
        .map(tool => tool.textContent).join(",");
    let oldObject = {
        title: (dialogBox.querySelector("h2")).textContent,
        date: (dialogBox.querySelector("section #date")).textContent,
        tags: JSON.parse(dialogBox.dataset.tags),
        tools: oldTools,
        deployment: oldUrl,
        coverType: "",
        srcs: [],
        articleHeader: (summaryContent.querySelector("h3")).textContent,
        description: oldDescription
    }

    const editDialog = document.createElement("dialog");
    editDialog.innerHTML = `
        <div>
            <button id="cancel">Cancel</button>
            <button class="close">x</close>
        </div>
        <form id="edit-data">
            ${buildProjectForm(oldObject)}
        </form>
    `;
    dialogBox.replaceWith(editDialog);
    editDialog.showModal();
    dialogHandling(editDialog, dialogBox);

    // handle form submission: saving changes into local storage
    const form = editDialog.querySelector("#edit-data");
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // hi browser, I will now write my own JS handling

        const updatedProj = {
            title: form.querySelector("#title").value,
            date: form.querySelector("#date").value,
            tags: Array.from(form.querySelector('select').selectedOptions).map(opt => opt.value),
            tools: form.querySelector("#tools").value.split(",").map(tool => tool.trim()),
            deployment: form.querySelector("#deployment").value,
            coverType: oldCoverType,
            srcs: JSON.parse(oldSrcs),
            articleHeader: form.querySelector("#article-header").value,
            description: form.querySelector('textarea').value.split("\n"),
        };

        const id = dialogBox.dataset.projectId;
        // if there is a new cover upload, handle it
        const fileInput = form.querySelector("#cover");
        handleCoverUpload(fileInput,updatedProj,() => {
            localStorage.setItem(id, JSON.stringify(updatedProj));
        });

        // now change the cardData
        const updateCard = document.querySelector(`project-card[data-id="${projectId}"]`);
        console.log(updateCard);
        fillCard(updateCard, JSON.parse(localStorage.getItem(projectId)), projectId)
        fillDialogInfo(dialogBox, JSON.parse(localStorage.getItem(projectId)));
        editDialog.replaceWith(dialogBox);

    });
}
export { enableEditMode, createNewProject };