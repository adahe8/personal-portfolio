class ProjectCard extends HTMLElement {
    static observedAttributes = ["data-title","data-tags","data-deploy-link","data-cover-type","data-srcs"];

    constructor(){
        super();
    }

    connectedCallback(){
        // want to put this component in shadow DOM in open mode, so it can be accessed and edited frequently
        const shadow = this.attachShadow({mode: "open"});
        this.render(shadow);

    }

    disconnectedCallback(){
        console.log(`${this.getAttribute("data-title")} was removed.`);
    }

    attributeChangedCallback(name, oldValue, newValue){
        this.render(this.shadowRoot);
    }

    render(shadow) {
        shadow.innerHTML = "";
        // setting up markup
        let display = document.createElement("div");
        display.setAttribute("class", "projectdisplay");

        // grabbing necessary data
        const projectName = this.getAttribute("data-title");
        const coverType = this.getAttribute("data-cover-type");
        const srcLinks = JSON.parse(this.getAttribute("data-srcs"));
        const tags = JSON.parse(this.getAttribute("data-tags"));

        // put the tags into the div as custom subject-tag elements
        tags.forEach(subject => {
            let newTag = document.createElement("subject-tag");
            newTag.textContent = subject;
            newTag.setAttribute("class",subject);
            display.appendChild(newTag);
        });

        // handle cover display: either video or image
        if(coverType === "video"){
            let vidCover = document.createElement("video");
            vidCover.setAttribute("autoplay","");
            vidCover.setAttribute("muted","");
            vidCover.setAttribute("loop","");
            srcLinks.forEach(src => {
                let vidType = src.slice((src.lastIndexOf('.'))+1);
                let source = document.createElement("source");
                source.setAttribute("src", src);
                source.setAttribute("type", `video/${vidType}`);
                source.setAttribute("aria-label", `A demonstration of ${projectName}.`);
                vidCover.appendChild(source);
            });
            vidCover.appendChild(document.createTextNode("Video not supported."));
            display.appendChild(vidCover);
        } else if(coverType === "image") {
            let imgCover = document.createElement("picture");
            imgCover.setAttribute("loading", "lazy");
            srcLinks.forEach(src => {
                let imgType = src.slice((src.lastIndexOf('.'))+1);
                if (imgType === "png"){
                    let img = document.createElement("img");
                    img.setAttribute("src", src);
                    img.setAttribute("alt", `The ${projectName} project deployed on a device.`);
                    imgCover.appendChild(img);
                }else{
                    let source = document.createElement("source");
                    source.setAttribute("srcset", src);
                    source.setAttribute("type", `image/${imgType}`);
                    imgCover.appendChild(source);
                }
            });
            display.appendChild(imgCover);
        } else {
            // error handling for me, the developer
            console.log("You put in an invalid cover type to the cover-type attribute. It has to be either image or video.");
        }

        // referencing external stylesheet
        const linkStyle = document.createElement("link");
        linkStyle.setAttribute("rel", "stylesheet");
        linkStyle.setAttribute("href", "components/projectCard.css");

        // putting it all together
        shadow.appendChild(linkStyle);
        shadow.appendChild(display);
        const title = document.createElement("h3");
        title.textContent = projectName;
        if(this.hasAttribute("data-deploy-link")){
            const anchor = document.createElement("a");
            anchor.setAttribute("href", this.getAttribute("data-deploy-link"));
            anchor.appendChild(title);
            shadow.appendChild(anchor);
        } else {
            shadow.appendChild(title);
        }
    }


}

customElements.define("project-card", ProjectCard);