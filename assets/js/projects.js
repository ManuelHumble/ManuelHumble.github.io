
document.addEventListener("DOMContentLoaded", loadProjects);

async function loadProjects() {
    const grid = document.getElementById("projects-grid");

    if (!grid) {
        console.error("Projects container not found.");
        return;
    }

    try {
        const listResponse = await fetch("projects/projects.json");

        if (!listResponse.ok) {
            throw new Error("Could not load projects.json");
        }

        const projectList = await listResponse.json();
        grid.replaceChildren();

        for (const folder of projectList.projects) {
            try {
                const response = await fetch(
                    `projects/${encodeURIComponent(folder)}/project.json`
                );

                if (!response.ok) {
                    console.error(`Could not load ${folder}`);
                    continue;
                }

                const project = await response.json();

                const card = document.createElement("article");
                card.className = "project-card";

                // Create image gallery
                const gallery = document.createElement("div");
                gallery.className = "project-gallery";

                const images = project.images?.length
                    ? project.images
                    : [project.image];

                let currentIndex = 0;

                const image = document.createElement("img");
                image.alt = project.title;
                image.loading = "lazy";
                image.style.width = "100%";
                image.style.display = "block";
                image.style.cursor = "zoom-in";

                image.onerror = function () {
                    this.onerror = null;
                    this.src =
                        "https://placehold.co/600x350?text=Project+Preview";
                };

                // Open larger image in a new tab
                image.addEventListener("click", function () {
                    window.open(this.src, "_blank", "noopener");
                });

                gallery.append(image);

                // Gallery navigation
                if (images.length > 1) {
                    const controls = document.createElement("div");
                    controls.style.display = "flex";
                    controls.style.justifyContent = "space-between";
                    controls.style.alignItems = "center";
                    controls.style.padding = "10px";

                    const previous = document.createElement("button");
                    previous.textContent = "← Previous";

                    const next = document.createElement("button");
                    next.textContent = "Next →";

                    const counter = document.createElement("span");

                    function showImage(index) {
                        currentIndex =
                            (index + images.length) % images.length;

                        image.src = images[currentIndex];
                        counter.textContent =
                            `${currentIndex + 1} / ${images.length}`;
                    }

                    previous.addEventListener("click", function () {
                        showImage(currentIndex - 1);
                    });

                    next.addEventListener("click", function () {
                        showImage(currentIndex + 1);
                    });

                    controls.append(previous, counter, next);
                    gallery.append(controls);

                    showImage(0);
                } else {
                    image.src = images[0] || project.image;
                }

                const content = document.createElement("div");
                content.className = "project-card-content";

                const title = document.createElement("h3");
                title.textContent = project.title;

                const description = document.createElement("p");
                description.textContent = project.description;

                content.append(title, description);

                if (project.tools?.length) {
                    const tools = document.createElement("p");
                    tools.textContent =
                        "Tools: " + project.tools.join(", ");
                    content.append(tools);
                }

                const buttons = document.createElement("div");
                buttons.className = "project-buttons";

                function addButton(label, url, secondary = false) {
                    if (!url || !url.startsWith("https://")) {
                        return;
                    }

                    const link = document.createElement("a");
                    link.href = url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.className = secondary
                        ? "btn btn-secondary"
                        : "btn";
                    link.textContent = label;

                    buttons.append(link);
                }

                addButton("Documentation", project.documentationUrl);
                addButton("View Dashboard", project.dashboardUrl, true);

                if (buttons.children.length) {
                    content.append(buttons);
                }

                card.append(gallery, content);
                grid.append(card);

            } catch (error) {
                console.error("Project loading error:", error);
            }
        }

        if (!grid.children.length) {
            grid.textContent = "No projects are available yet.";
        }

    } catch (error) {
        console.error("Could not load projects:", error);
        grid.textContent =
            "Unable to load projects. Please try again later.";
    }
}
