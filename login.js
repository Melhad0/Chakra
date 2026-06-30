import { loadGame, setUsername, setAuthMode, authMode } from './game.js';

export function toggleAuthMode() {
    const btn = document.getElementById('login-action-btn');
    const link = document.getElementById('auth-switch-link');
    const error = document.getElementById('login-error-msg');
    error.innerText = "";
    if (authMode === "login") {
        setAuthMode("register");
        btn.innerText = "Registrar Shinobi";
        link.innerText = "Já tem conta? Faça Login aqui";
    } else {
        setAuthMode("login");
        btn.innerText = "Entrar na Vila";
        link.innerText = "Não tem conta? Registre-se aqui";
    }
}

export function submitAuth(type) {
    const user = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    const error = document.getElementById('login-error-msg');
    
    if (!user || !pass) {
        error.innerText = "Preencha todos os campos!";
        return;
    }

    const url = authMode === "login" ? "/api/login" : "/api/register";
    
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            error.innerText = data.error;
        } else {
            if (authMode === "register") {
                error.style.color = "lightgreen";
                error.innerText = "Shinobi registrado! Faça login.";
                setAuthMode("login");
                toggleAuthMode();
            } else {
                localStorage.setItem('username', data.username);
                window.location.href = "index.html";
            }
        }
    })
    .catch(err => {
        error.innerText = "Erro de conexão com o servidor!";
        console.error(err);
    });
}

window.submitAuth = submitAuth;
window.toggleAuthMode = toggleAuthMode;
