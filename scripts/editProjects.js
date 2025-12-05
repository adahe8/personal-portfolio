// my choice: a local storage-based approach, so that when you load remote you can pull back the original data
    // also a strategic choice since I wrote that data and would like to keep that information on my site
// TODOs: 
    // UPDATE: allow the user to edit the dialog popup with a double click
    // CREATE: allow the user to add a card - make a form that prompts them for the extra data needed pop up
    // DELETE: add a delete button near each card (or do select and delete option) that allows users to delete cards from local
    
    // Note: the way I'm planning it, this would only work if the user loads from local and not if they load from remote
        // since then the data is not being pulled from modifiable local storage
export function enableEditMode(dialogBox) {
    const summaryContent = dialogBox.querySelector("article");
    dialogBox.addEventListener("click", () => {
        console.log("edit mode activated!");
        // switch inside of dialog to form for editing mode (use CSS to make this look how the dialog currently looks)
        // TODO: show some other indicator (maybe a little css fade-in message to tell user that they're in edit mode)
        const oldTitle = dialogBox.querySelector("h2").textContent;
        const oldDates = dialogBox.querySelector("#date").textContent;
        const oldBlogName = summaryContent.querySelector("h3");
        let oldDescription = Array.from(summaryContent.querySelectorAll("p"))
            .map(p => p.textContent).join("\n");
        const button = dialogBox.querySelector("button");
        const oldUrl = button.dataset.url ? `${button.dataset.url}` : "";
        let oldTools = Array.from(dialogBox.querySelectorAll("span"))
            .map(tool => tool.textContent).join(",");
        const oldTags = JSON.parse(dialogBox.dataset.tags);

        const allTags = ["ai", "design", "frontend", "fullstack", "backend", "other"];
        const tagSelect = allTags.map(tag =>
            `<option value="${tag}"${oldTags.includes(tag)?" selected" : ""}>${tag}</option>`
        ).join("");

        dialogBox.innerHTML = `
            <form id="edit-data">
                <input id="title" type="text" value="${oldTitle}" />
                <input id="timeline" type="text" value="${oldDates}" />
                <marquee-container>
                    <p>Tech Stack</p>
                    <input id="tools" type="text" value="${oldTools}" />
                </marquee-container>
                <input id="deployment" type="url" value="${oldUrl}" />
                <input id="article-header" type="text" value="${oldBlogName}" />
                <textarea id="description" rows=21>${oldDescription}</textarea>
                <label>Tags</label>
                <select id="edittags" multiple>${tagSelect}</select>
                <label> Cover Image or Demo: </label>
                <input id="cover" type="file" accept="image/*, video/*"/>
                <button type="submit">Save</button>
            </form>
        `;
        // handle form submission: saving changes into local storage
        const form = dialogBox.querySelector("#edit-data");
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // hi browser, I will now write my own JS handling

            const updatedProj = {
                title: form.querySelector("#title").value,
                date: form.querySelector("#timeline").value,
                tags: Array.from(form.querySelector("#edittags").selectedOptions).map(opt => opt.value),
                tools: form.querySelector("#tools").value.split(",").map(tool => tool.trim()),
                deployment: form.querySelector("#deployment").value,
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
    });
}