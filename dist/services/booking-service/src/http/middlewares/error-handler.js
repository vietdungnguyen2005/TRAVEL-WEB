export function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
//# sourceMappingURL=error-handler.js.map