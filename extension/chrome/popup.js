const autoCaptureToggle = document.getElementById("autoCapture");
const testButton = document.getElementById("testConnection");
const statusEl = document.getElementById("status");

function setStatus(text, level = "") {
    statusEl.textContent = text;
    statusEl.className = `status ${level}`.trim();
}

function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response || {});
        });
    });
}

async function loadState() {
    try {
        const state = await sendMessage({ type: "popup-get-state" });
        if (!state.success) {
            throw new Error(state.error || "Failed to load state");
        }

        autoCaptureToggle.checked = !!state.autoCapture;
        setStatus(state.autoCapture ? "Auto Capture is ON" : "Auto Capture is OFF");
    } catch (err) {
        setStatus(`State error: ${err.message}`, "err");
    }
}

async function toggleAutoCapture() {
    const enabled = autoCaptureToggle.checked;
    setStatus("Saving setting...");

    try {
        const result = await sendMessage({
            type: "popup-set-auto-capture",
            enabled,
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to update setting");
        }

        setStatus(enabled ? "Auto Capture enabled" : "Auto Capture disabled", "ok");
    } catch (err) {
        autoCaptureToggle.checked = !enabled;
        setStatus(`Save failed: ${err.message}`, "err");
    }
}

async function testConnection() {
    testButton.disabled = true;
    setStatus("Checking desktop app connection...");

    try {
        const result = await sendMessage({ type: "popup-test-connection" });
        if (!result.success) {
            throw new Error(result.error || "Desktop app unavailable");
        }
        setStatus("Connection OK: desktop app is reachable", "ok");
    } catch (err) {
        setStatus(`Connection failed: ${err.message}`, "err");
    } finally {
        testButton.disabled = false;
    }
}

autoCaptureToggle.addEventListener("change", toggleAutoCapture);
testButton.addEventListener("click", testConnection);

loadState();
