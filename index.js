const mongo = require('./mongo');
module.exports = (options) => {
  return function mongoose(ctx, next) {
    if (ctx.app.context.model) return next();
    mongo(ctx, options);
    return next();
  };
};
