
export function submitAuth(type) {
    const user = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    const error = document.getElementById('login-error-msg');
    
    error.style.color = "var(--accent-color)";
    
    if (!user || !pass) {
        error.innerText = "Preencha todos os campos!";
        return;
    }

    const url = type === "login" ? "/api/login" : "/api/register";
    
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            error.style.color = "var(--accent-color)";
            error.innerText = data.error;
        } else {
            if (type === "register") {
                error.style.color = "lightgreen";
                error.innerText = "Shinobi registrado! Agora clique em Entrar.";
            } else {
                localStorage.setItem('username', data.username);
                window.location.href = "index.html";
            }
        }
    })
    .catch(err => {
        error.style.color = "var(--accent-color)";
        error.innerText = "Erro de conexão com o servidor!";
        console.error(err);
    });
}

export function toggleAuthMode() {}

window.submitAuth = submitAuth;
window.toggleAuthMode = toggleAuthMode;
