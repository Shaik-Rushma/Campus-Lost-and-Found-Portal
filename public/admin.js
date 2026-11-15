
const claimsContainer = document.getElementById("claimsContainer");

const token = localStorage.getItem("token");

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
async function loadStats() {
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("/api/admin/stats", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const stats = await response.json();

        if (!response.ok) {
            alert(stats.message || "Unable to load statistics.");
            return;
        }

        document.getElementById("totalUsers").textContent =
            stats.totalUsers;

        document.getElementById("totalItems").textContent =
            stats.totalItems;

        document.getElementById("pendingClaims").textContent =
            stats.pendingClaims;

        document.getElementById("approvedClaims").textContent =
            stats.approvedClaims;

    } catch (error) {
        console.error("Statistics error:", error);
    }
}
// Load all student claims
async function loadClaims() {
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("/api/claims", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const claims = await response.json();

        if (!response.ok) {
            claimsContainer.textContent =
                claims.message || "Unable to load claims.";
            return;
        }

        claimsContainer.replaceChildren();

        if (claims.length === 0) {
            claimsContainer.textContent = "No claims submitted yet.";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent = "Claim Request";

            const itemName = document.createElement("p");
            itemName.textContent =
                `Item: ${claim.item?.name || "Item ID: " + claim.item}`;

            const student = document.createElement("p");
            student.textContent =
                `Claimed By: ${claim.claimedBy?.name || "Student"}`;

            const message = document.createElement("p");
            message.textContent = `Message: ${claim.message}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${claim.status}`;

            card.append(heading, itemName, student, message, status);

            if (claim.status === "pending") {
                ["approved", "rejected"].forEach(action => {
                    const button = document.createElement("button");
                    button.textContent =
                        action === "approved" ? "Approve" : "Reject";

                    button.addEventListener("click", () => {
                        updateClaim(claim._id, action);
                    });

                    card.appendChild(button);
                });
            }

            claimsContainer.appendChild(card);
        });

    } catch (error) {
        claimsContainer.textContent = "Server connection failed.";
        console.error(error);
    }
}

// Approve or reject a claim
async function updateClaim(claimId, status) {
    try {
        const response = await fetch(`/api/claims/${claimId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        alert(result.message || "Claim updated.");
        
        if (response.ok) {
            loadClaims();
        }

    } catch (error) {
        alert("Unable to update claim.");
    }
}
loadStats();
loadClaims();
