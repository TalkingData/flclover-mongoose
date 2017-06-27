module.exports = (filepath) => {
  try {
    // eslint-disable-next-line
    const obj = require(filepath);
    if (!obj) return obj;
    // it's es module
    // eslint-disable-next-line
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    err.message = `[core] load file: ${filepath}, error: ${err.message}`;
    throw err;
  }
};
