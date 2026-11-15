
const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const message = document.getElementById("message");

    if (!token) {
        message.textContent = "Please log in before reporting an item.";
        message.style.color = "red";
        return;
    }

    const itemData = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        building: document.getElementById("building").value.trim(),
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        image: document.getElementById("image").value.trim()
    };

    try {
        const response = await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Item reported successfully!";
            message.style.color = "green";
            reportForm.reset();
        } else {
            message.textContent = data.message || "Failed to report item.";
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent = "Server connection failed.";
        message.style.color = "red";
    }
});
