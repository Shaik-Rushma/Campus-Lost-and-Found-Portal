
const API_URL = "/api/items";

// Load and display items
async function loadItems() {
    const container = document.getElementById("itemsContainer");

    const search = document.getElementById("searchInput").value;
    const type = document.getElementById("typeFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const building = document.getElementById("buildingFilter").value;

    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    if (building) params.append("building", building);

    container.textContent = "Loading items...";

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Unable to load items.");
        }

        const items = await response.json();

        container.replaceChildren();

        if (items.length === 0) {
            container.textContent = "No items found.";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent = item.name;

            const details = [
                `Category: ${item.category}`,
                `Type: ${item.type}`,
                `Location: ${item.location}`,
                `Building: ${item.building}`,
                `Description: ${item.description}`,
                `Date: ${new Date(item.date).toLocaleDateString()}`,
                `Status: ${item.status}`
            ];

            card.appendChild(heading);

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            if (item.image) {
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = item.name;
                image.style.maxWidth = "100%";
                card.appendChild(image);
            }
     // Add a claim button for open items
            if (item.status === "open" && item.type === "found") {
                const claimButton = document.createElement("button");
                claimButton.textContent = "Claim This Item";

                claimButton.addEventListener("click", async () => {
                    const token = localStorage.getItem("token");

                    if (!token) {
                        alert("Please log in to claim an item.");
                        window.location.href = "login.html";
                        return;
                    }

                    const message = prompt(
                        "Explain why this item belongs to you:"
                    );

                    if (!message || !message.trim()) {
                        alert("Please enter a claim message.");
                        return;
                    }

                    try {
                        const response = await fetch(
                            `/api/claims/${item._id}`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    message: message.trim()
                                })
                            }
                        );

                        const result = await response.json();

                        alert(result.message || "Claim submitted.");
                    } catch (error) {
                        alert("Unable to submit your claim.");
                    }
                });

                card.appendChild(claimButton);
            }
            container.appendChild(card);

        });

    } catch (error) {
        container.textContent = "Unable to load items. Please try again.";
        console.error(error);
    }
}

// Load items when homepage opens
document.addEventListener("DOMContentLoaded", loadItems);
