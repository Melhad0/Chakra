
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
        // Fallback para modo offline / Live Server sem backend Flask ativo
        console.warn("Servidor backend offline, entrando em modo shinobi local:", err);
        localStorage.setItem('username', user);
        window.location.href = "index.html";
    });
}

export function toggleAuthMode() {}

window.submitAuth = submitAuth;
window.toggleAuthMode = toggleAuthMode;
