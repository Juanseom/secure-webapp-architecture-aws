const API_BASE_URL = "https://localhost:5000/api";
const REQUEST_TIMEOUT_MS = 10000;

let appState = {
    token: null,
    username: null,
    loginTime: null,
    healthIntervalId: null
};

/**
 * Muestra/oculta el indicador de carga
 * @param {boolean} show
 */
function showLoading(show) {
    const el = document.getElementById("loadingIndicator");
    el.classList.toggle("hidden", !show);
}

/**
 * Muestra una alerta de error
 * @param {string} message
 */
function showError(message) {
    const el = document.getElementById("errorAlert");
    el.textContent = message;
    el.classList.remove("hidden");
}

/**
 * Oculta la alerta de error
 */
function hideError() {
    document.getElementById("errorAlert").classList.add("hidden");
}

/**
 * Muestra el formulario de login
 */
function showLogin() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("dashboard").classList.add("hidden");
}

/**
 * Muestra el dashboard después del login
 */
function showDashboard() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    document.getElementById("usernameBadge").textContent = appState.username;
    document.getElementById("sessionUser").textContent = appState.username;
    document.getElementById("tokenPreview").textContent = `${appState.token.substring(0, 20)}...`;
    document.getElementById("loginTime").textContent = appState.loginTime.toLocaleString("es-ES");
}

/**
 * Realiza una solicitud HTTPS y devuelve la respuesta en formato JSON
 * @param {string} path - Ruta del endpoint
 * @param {object} options - Opciones de la solicitud
 * @returns {Promise<object>}
 */
async function fetchJson(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Realiza login asincrónico
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{token: string, expiresIn: number}>}
 */
async function login(username, password) {
    const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
    });

    if (!data.token) {
        throw new Error("Token no recibido");
    }

    appState.token = data.token;
    appState.username = username;
    appState.loginTime = new Date();

    sessionStorage.setItem("authToken", data.token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("loginTime", appState.loginTime.toISOString());
}

/**
 * Obtiene el estado de salud del servidor
 * @returns {Promise<object>}
 */
async function loadHealth() {
    const health = await fetchJson("/health", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${appState.token}`
        }
    });

    document.getElementById("healthStatus").innerHTML = `
        <p><strong>Estado:</strong> ${health.status || "UNKNOWN"}</p>
        <p><strong>Timestamp:</strong> ${health.timestamp ? new Date(health.timestamp).toLocaleString("es-ES") : "-"}</p>
    `;
}

/**
 * Cierra sesión y retorna al login
 */
function logout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("loginTime");

    if (appState.healthIntervalId) {
        clearInterval(appState.healthIntervalId);
        appState.healthIntervalId = null;
    }

    appState = { token: null, username: null, loginTime: null, healthIntervalId: null };
    showLogin();
}

/**
 * Restaura la sesión si existe en sessionStorage
 */
function restoreSessionIfExists() {
    const token = sessionStorage.getItem("authToken");
    const username = sessionStorage.getItem("username");
    const loginTime = sessionStorage.getItem("loginTime");

    if (!token || !username || !loginTime) {
        return false;
    }

    appState.token = token;
    appState.username = username;
    appState.loginTime = new Date(loginTime);
    return true;
}

/**
 * Inicialización del DOM
 */
document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const logoutBtn = document.getElementById("logoutBtn");

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideError();
        showLoading(true);

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            showLoading(false);
            showError("Debes ingresar usuario y contrasena");
            return;
        }

        try {
            await login(username, password);
            showDashboard();
            await loadHealth();

            if (appState.healthIntervalId) {
                clearInterval(appState.healthIntervalId);
            }
            appState.healthIntervalId = setInterval(async () => {
                try {
                    await loadHealth();
                } catch (e) {
                    document.getElementById("healthStatus").innerHTML = `<p>Error consultando estado: ${e.message}</p>`;
                }
            }, 30000);
        } catch (error) {
            showError(`Error de login: ${error.message}`);
        } finally {
            showLoading(false);
        }
    });

    logoutBtn.addEventListener("click", logout);

    if (restoreSessionIfExists()) {
        showDashboard();
        loadHealth().catch((e) => {
            document.getElementById("healthStatus").innerHTML = `<p>Error consultando estado: ${e.message}</p>`;
        });
        appState.healthIntervalId = setInterval(() => {
            loadHealth().catch(() => {});
        }, 30000);
    } else {
        showLogin();
    }
});

console.log("Secure Web App Frontend cargado");
console.log("API Base URL:", API_BASE_URL);
console.log("Timeout(ms):", REQUEST_TIMEOUT_MS);
