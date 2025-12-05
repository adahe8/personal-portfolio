// my choice: a local storage-based approach, so that when you load remote you can pull back the original data
    // also a strategic choice since I wrote that data and would like to keep that information on my site
// TODOs: 
    // UPDATE: allow the user to edit the dialog popup with a double click
    // CREATE: allow the user to add a card - make a form that prompts them for the extra data needed pop up
    // DELETE: add a delete button near each card (or do select and delete option) that allows users to delete cards from local
    
    // Note: the way I'm planning it, this would only work if the user loads from local and not if they load from remote
        // since then the data is not being pulled from modifiable local storage
export function enableEditMode(dialogBox, oldCoverType, oldSrcs) {
    console.log(oldCoverType);
    console.log(oldSrcs);
    const summaryContent = dialogBox.querySelector("article");

    // switch inside of dialog to form for editing mode (use CSS to make this look how the dialog currently looks)
    // TODO: show some other indicator (maybe a little css fade-in message to tell user that they're in edit mode)
    const oldTitle = (dialogBox.querySelector("h2")).textContent;
    const oldDates = (dialogBox.querySelector("section #date")).textContent;
    const oldBlogName = (summaryContent.querySelector("h3")).textContent;
    let oldDescription = Array.from(summaryContent.querySelectorAll("article p"))
        .map(p => p.textContent).join("\n");
    const button = dialogBox.querySelector("#todeployment");
    const oldUrl = button.dataset.url ? `${button.dataset.url}` : "";
    let oldTools = Array.from(dialogBox.querySelectorAll("span"))
        .map(tool => tool.textContent).join(",");
    const oldTags = JSON.parse(dialogBox.dataset.tags);

    const allTags = ["ai", "design", "frontend", "fullstack", "backend", "other"];
    const tagSelect = allTags.map(tag =>
        `<option value="${tag}"${oldTags.includes(tag)?" selected" : ""}>${tag}</option>`
    ).join("");

    const editDialog = document.createElement("dialog");
    editDialog.innerHTML = `
        <div>
            <button id="cancel">Cancel</button>
            <button id="close">x</close>
        </div>
        <form id="edit-data">
            <label for="title">Project title.</label>
            <input id="title" type="text" value="${oldTitle}" />
            <label for="timeline">Span of time the project was worked on.</label>
            <input id="timeline" type="text" value="${oldDates}" />
            <marquee-container>
                <p>Tech Stack</p>
                <input id="tools" type="text" value="${oldTools}" />
            </marquee-container>
            <label for="deployment">Link to project deployment.</label>
            <input id="deployment" type="url" value="${oldUrl}" />
            <label for="article-header">A fun title for the project reflection.</label>
            <input id="article-header" type="text" value="${oldBlogName}" />
            <label for="description">Project description.</label>
            <textarea id="description" rows=21>${oldDescription}</textarea>
            <label for="edittags">Select the project topics.</label>
            <select id="edittags" multiple>${tagSelect}</select>
            <label for="cover">Upload a image or video to change the project cover.</label>
            <input id="cover" type="file" accept="image/*, video/*"/>
            <button type="submit">Save</button>
        </form>
    `;
    dialogBox.replaceWith(editDialog);
    editDialog.showModal();
    // attach listeners to the form buttons
    editDialog.querySelector("#cancel").addEventListener("click", () => {
        editDialog.replaceWith(dialogBox);
    });
    editDialog.querySelector("#close").addEventListener("click", () => {
        editDialog.close();
    });
    editDialog.addEventListener("close", function() {
        editDialog.parentNode.remove();
    });

    // handle form submission: saving changes into local storage
    const form = editDialog.querySelector("#edit-data");
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // hi browser, I will now write my own JS handling

        const updatedProj = {
            title: form.querySelector("#title").value,
            date: form.querySelector("#timeline").value,
            tags: Array.from(form.querySelector("#edittags").selectedOptions).map(opt => opt.value),
            tools: form.querySelector("#tools").value.split(",").map(tool => tool.trim()),
            deployment: form.querySelector("#deployment").value,
            coverType: oldCoverType,
            srcs: JSON.parse(oldSrcs),
            articleHeader: form.querySelector("#article-header").value,
            description: form.querySelector("#description").value.split("\n"),
        };

        const id = dialogBox.dataset.projectId;
        // if there is a new cover upload, handle it
        const fileInput = form.querySelector("#cover");
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updatedProj["srcs"] = [event.target.result];
                const uploadType = fileInput.files[0].type;
                updatedProj["coverType"] = uploadType.includes("image") ? "image" : "video";
                localStorage.setItem(id, JSON.stringify(updatedProj));
            };
            reader.readAsDataURL(fileInput.files[0]);
        }else{
            localStorage.setItem(id, JSON.stringify(updatedProj));
        }
    });
}