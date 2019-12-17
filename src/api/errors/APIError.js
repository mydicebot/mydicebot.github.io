module.exports  = class APIError extends Error {
  constructor(message, obj) {
    super(message);
    this.name = 'APIError';
    this.error = obj.value;
    this.description = obj.value;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
