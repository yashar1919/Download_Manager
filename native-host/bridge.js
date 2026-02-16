#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ENDPOINT_HOST = "127.0.0.1";
const ENDPOINT_PORT = 37821;
const ENDPOINT_PATH = "/api/enqueue";
const HEALTH_PATH = "/api/health";
const CONFIG_PATH = path.join(__dirname, "host.config.json");

function readConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return {};
        }
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        return {};
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLaunchCommand() {
    if (process.env.DM_APP_LAUNCH_CMD && process.env.DM_APP_LAUNCH_CMD.trim()) {
        return process.env.DM_APP_LAUNCH_CMD.trim();
    }

    const config = readConfig();
    if (typeof config.launchCommand === "string" && config.launchCommand.trim()) {
        return config.launchCommand.trim();
    }

    const commands = config.launchCommands || {};
    if (typeof commands[process.platform] === "string" && commands[process.platform].trim()) {
        return commands[process.platform].trim();
    }

    if (process.platform === "win32") {
        return null;
    }

    if (process.platform === "linux") {
        return "uvdm";
    }

    return null;
}

function launchDesktopApp() {
    const launchCommand = getLaunchCommand();
    if (!launchCommand) {
        throw new Error("Desktop app is not running and no launch command is configured");
    }

    const child = spawn(launchCommand, {
        shell: true,
        detached: true,
        stdio: "ignore",
    });

    child.unref();
}

function checkHealth() {
    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                host: ENDPOINT_HOST,
                port: ENDPOINT_PORT,
                path: HEALTH_PATH,
                method: "GET",
            },
            (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(true);
                    return;
                }

                reject(new Error(`Health check failed with status ${res.statusCode}`));
            }
        );

        req.setTimeout(1200, () => {
            req.destroy(new Error("Health check timeout"));
        });
        req.on("error", (err) => reject(err));
        req.end();
    });
}

async function waitUntilDesktopReady() {
    const config = readConfig();
    const retryIntervalMs = Number(config.retryIntervalMs || 700);
    const maxRetries = Number(config.maxRetries || 10);

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
        try {
            await checkHealth();
            return true;
        } catch (err) {
            await sleep(retryIntervalMs);
        }
    }

    throw new Error("Desktop app did not become ready in time");
}

function isConnectionRefused(err) {
    return (
        err?.code === "ECONNREFUSED" ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        /ECONNREFUSED|ECONNRESET|ETIMEDOUT|socket hang up|Health check timeout/i.test(err?.message || "")
    );
}

function readMessage(callback) {
    let buffer = Buffer.alloc(0);

    process.stdin.on("readable", () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
            buffer = Buffer.concat([buffer, chunk]);

            while (buffer.length >= 4) {
                const length = buffer.readUInt32LE(0);
                if (buffer.length < 4 + length) {
                    break;
                }

                const body = buffer.slice(4, 4 + length).toString("utf8");
                buffer = buffer.slice(4 + length);

                try {
                    callback(JSON.parse(body));
                } catch (error) {
                    writeMessage({ success: false, error: "Invalid JSON payload" });
                }
            }
        }
    });
}

function writeMessage(message) {
    const json = JSON.stringify(message);
    const data = Buffer.from(json, "utf8");
    const header = Buffer.alloc(4);
    header.writeUInt32LE(data.length, 0);
    process.stdout.write(Buffer.concat([header, data]));
}

function postToDesktop(url, source) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ url, source: source || "native-host" });

        const req = http.request(
            {
                host: ENDPOINT_HOST,
                port: ENDPOINT_PORT,
                path: ENDPOINT_PATH,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            },
            (res) => {
                let body = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ success: true });
                        return;
                    }
                    reject(new Error(`Desktop bridge failed: ${res.statusCode} ${body}`));
                });
            }
        );

        req.setTimeout(2000, () => {
            req.destroy(new Error("Desktop bridge timeout"));
        });
        req.on("error", (err) => reject(err));
        req.write(payload);
        req.end();
    });
}

readMessage(async (message) => {
    if (message?.type !== "enqueue" || typeof message?.url !== "string") {
        writeMessage({ success: false, error: "Unsupported message" });
        return;
    }

    if (!/^https?:\/\//i.test(message.url.trim())) {
        writeMessage({ success: false, error: "Invalid URL" });
        return;
    }

    try {
        await postToDesktop(message.url.trim(), message.source);
        writeMessage({ success: true });
    } catch (err) {
        if (!isConnectionRefused(err)) {
            writeMessage({ success: false, error: err.message });
            return;
        }

        try {
            launchDesktopApp();
            await waitUntilDesktopReady();
            await postToDesktop(message.url.trim(), message.source);
            writeMessage({ success: true, autoLaunched: true });
        } catch (launchErr) {
            writeMessage({ success: false, error: launchErr.message });
        }
    }
});
