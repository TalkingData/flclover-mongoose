const loadFile = require('./loadfile');
module.exports = (options) => {
  return function mongoose(ctx, next) {
    if (ctx.app.mongoLoaded) return next();
    const mongo = loadFile('./mongo');
    ctx.app.mongoLoaded = true;
    mongo(ctx, options);
    return next();
  };
};
