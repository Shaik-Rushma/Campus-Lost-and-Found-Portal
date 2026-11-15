
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            message.textContent = data.message || "Login failed.";
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent = "Server connection failed.";
        message.style.color = "red";
    }
});
