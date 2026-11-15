
const myItemsContainer = document.getElementById("myItems");

const token = localStorage.getItem("token");

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// Load items reported by the logged-in user
async function loadMyItems() {
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("/api/items/my-items", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const items = await response.json();

        if (!response.ok) {
            myItemsContainer.textContent =
                items.message || "Failed to load your items.";
            return;
        }

        myItemsContainer.innerHTML = "";

        if (items.length === 0) {
            myItemsContainer.textContent =
                "You have not reported any items yet.";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";

            const name = document.createElement("h3");
            name.textContent = item.name;

            const type = document.createElement("p");
            type.textContent = `Type: ${item.type}`;

            const category = document.createElement("p");
            category.textContent = `Category: ${item.category}`;

            const location = document.createElement("p");
            location.textContent = `Location: ${item.location}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${item.status}`;

            card.append(name, type, category, location, status);
            myItemsContainer.appendChild(card);
        });

    } catch (error) {
        myItemsContainer.textContent =
            "Unable to connect to the server.";
    }
}

loadMyItems();
// Load claims submitted by the logged-in user
async function loadMyClaims() {
    const container = document.getElementById("myClaimsContainer");

    try {
        const response = await fetch("/api/claims/my-claims", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const claims = await response.json();

        if (!response.ok) {
            container.textContent =
                claims.message || "Unable to load claims.";
            return;
        }

        container.replaceChildren();

       if (claims.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent =
        "You have not submitted any claims yet.";

    container.appendChild(emptyMessage);
    return;
}
        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent =
                claim.item?.name || "Item details unavailable";

            const message = document.createElement("p");
            message.textContent = `Your Message: ${claim.message}`;

            const status = document.createElement("p");
            status.textContent = `Claim Status: ${claim.status}`;

            card.append(heading, message, status);
            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Unable to connect to the server.";
        console.error(error);
    }
}

loadMyClaims();