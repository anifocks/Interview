function ok(res, data, message) {
    return res.json({ success: true, message: message || null, data });
}

function created(res, data, message) {
    return res.status(201).json({ success: true, message: message || "Created", data });
}

function fail(res, status, message) {
    return res.status(status).json({ success: false, message });
}

module.exports = {
    ok,
    created,
    fail
};