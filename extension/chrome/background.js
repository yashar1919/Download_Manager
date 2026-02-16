const NATIVE_HOST_NAME = "com.univision.uvdm.bridge";
const LOCAL_ENDPOINT = "http://127.0.0.1:37821/api/enqueue";
const HEALTH_ENDPOINT = "http://127.0.0.1:37821/api/health";
const MENU_IDS = {
    link: "uvdm-send-link",
    page: "uvdm-send-page",
};

function notify(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon-128.png",
        title,
        message,
    });
}

async function setAutoCaptureEnabled(enabled) {
    await chrome.storage.local.set({ autoCapture: !!enabled });
    const text = enabled ? "ON" : "";
    const color = enabled ? "#7c3aed" : "#64748b";
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
}

async function getAutoCaptureEnabled() {
    const { autoCapture } = await chrome.storage.local.get({ autoCapture: false });
    return !!autoCapture;
}

function isHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function sendNativeMessage(payload) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, payload, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response || {});
        });
    });
}

async function sendLocalHttp(url, source) {
    const response = await fetch(LOCAL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, source }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Local endpoint failed: ${response.status} ${text}`);
    }

    return true;
}

async function checkConnection() {
    const response = await fetch(HEALTH_ENDPOINT, {
        method: "GET",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Health check failed: ${response.status} ${text}`);
    }

    return true;
}

async function enqueueUrl(url, source) {
    if (!isHttpUrl(url)) {
        return false;
    }

    try {
        const nativeResponse = await sendNativeMessage({ type: "enqueue", url, source });
        if (nativeResponse?.success) {
            return true;
        }
    } catch (err) {
        // Native host is optional in MVP; fallback to local HTTP bridge.
    }

    try {
        await sendLocalHttp(url, source);
        return true;
    } catch (err) {
        console.error("Failed to send URL to UVDM:", err);
        return false;
    }
}

function createMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: MENU_IDS.link,
            title: "Download with UVDM",
            contexts: ["link"],
        });

        chrome.contextMenus.create({
            id: MENU_IDS.page,
            title: "Send this page URL to UVDM",
            contexts: ["page"],
        });
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    createMenus();
    const { autoCapture } = await chrome.storage.local.get({ autoCapture: false });
    await setAutoCaptureEnabled(!!autoCapture);
});

chrome.runtime.onStartup.addListener(async () => {
    createMenus();
    const enabled = await getAutoCaptureEnabled();
    await setAutoCaptureEnabled(enabled);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === MENU_IDS.link && isHttpUrl(info.linkUrl)) {
        const ok = await enqueueUrl(info.linkUrl, "context-menu-link");
        if (ok) {
            notify("UVDM by Univision", "Link sent to desktop app.");
        } else {
            notify("UVDM by Univision", "Could not reach desktop app.");
        }
        return;
    }

    if (info.menuItemId === MENU_IDS.page && isHttpUrl(info.pageUrl)) {
        const ok = await enqueueUrl(info.pageUrl, "context-menu-page");
        if (ok) {
            notify("UVDM by Univision", "Page URL sent to desktop app.");
        } else {
            notify("UVDM by Univision", "Could not reach desktop app.");
        }
    }
});

chrome.downloads.onCreated.addListener(async (item) => {
    const { autoCapture } = await chrome.storage.local.get({ autoCapture: false });
    if (!autoCapture) {
        return;
    }

    const targetUrl = item.finalUrl || item.url;
    if (!isHttpUrl(targetUrl)) {
        return;
    }

    const accepted = await enqueueUrl(targetUrl, "downloads-onCreated");
    if (!accepted) {
        return;
    }

    try {
        await chrome.downloads.cancel(item.id);
        await chrome.downloads.erase({ id: item.id });
        notify("UVDM by Univision", "Chrome download captured and moved to desktop app.");
    } catch (err) {
        console.warn("Auto-capture cancel failed:", err);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "popup-get-state") {
        getAutoCaptureEnabled()
            .then((enabled) => sendResponse({ success: true, autoCapture: enabled }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message?.type === "popup-set-auto-capture") {
        const enabled = !!message.enabled;
        setAutoCaptureEnabled(enabled)
            .then(() => sendResponse({ success: true, autoCapture: enabled }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message?.type === "popup-test-connection") {
        checkConnection()
            .then(() => sendResponse({ success: true }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
    }

    return false;
});
