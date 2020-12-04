
class AppError extends Error {
    constructor(type, message) {
        super(`Error ${type}: ${message}`);
        this.data = {
            type,
            message,
        }
    }
}

module.exports = AppError;