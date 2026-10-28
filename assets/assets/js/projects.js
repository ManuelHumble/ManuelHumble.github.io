
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

                const image = document.createElement("img");
                image.src = project.image;
                image.alt = project.title;
                image.loading = "lazy";

                image.onerror = function () {
                    this.onerror = null;
                    this.src =
                        "https://placehold.co/600x350?text=Project+Preview";
                };

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

                addButton(
                    "Documentation",
                    project.documentationUrl
                );

                addButton(
                    "View Dashboard",
                    project.dashboardUrl,
                    true
                );

                if (buttons.children.length) {
                    content.append(buttons);
                }

                card.append(image, content);
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
