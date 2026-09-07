function log(level, service, message) {
    const stamp = new Date().toISOString();
    console[level === "error" ? "error" : "log"](`[${stamp}] [${service}] ${message}`);
}

module.exports = {
    info: (service, message) => log("info", service, message),
    error: (service, message) => log("error", service, message),
    warn: (service, message) => log("warn", service, message)
};