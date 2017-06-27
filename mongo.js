const assert = require('assert');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const loadFile = require('./loadfile.js');
// const EventEmitter = require('events');
// const awaitEvent = require('await-event');

const createModel = (dir, file, db) => {
  const map = {};
  const list = [];
  const fns = loadFile(`${dir}/${file}`);
  Object.keys(fns).forEach(v => list.push([v, fns[v]]));
  list.forEach((arr) => {
    map[arr[0]] = async (params) => {
      const data = await arr[1](db, params);
      return data;
    };
  });
  return map;
};

const loadSchema = (ctx, db) => {
  console.log('loadSchema');
  const d = db;
  const dir = path.join(process.cwd(), 'app/schema');
  const schema = {};
  fs.readdirSync(dir).forEach((file) => {
    schema[file.slice(0, -3)] = loadFile(`${dir}/${file}`)(db);
  });
  // console.log(schema);
  d.schema = schema;
};
const loadModel = (ctx, db) => {
  const dir = path.join(process.cwd(), 'app/model');
  const model = {};
  fs.readdirSync(dir).forEach((file) => {
    model[file.slice(0, -3)] = createModel(dir, file, db);
  });
  ctx.app.context.model = model;
};

module.exports = (ctx, config) => {
  assert(config.url, '[mongoose] url is required on config');
  console.info('[mongoose] connecting %s', config.url);

  mongoose.Promise = Promise;

  // mongoose.connect('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]' [, options]);
  const db = mongoose.createConnection(config.url, config.options);
  db.Schema = mongoose.Schema;
  ctx.mongoose = db;

  // const heartEvent = new EventEmitter();
  // heartEvent.await = awaitEvent;

  db.on('error', (e) => {
    const err = e;
    err.message = `[mongoose]${err.message}`;
    console.error(err);
  });

  db.on('disconnected', () => {
    console.error(`[mongoose] ${config.url} disconnected`);
  });

  db.on('connected', () => {
    // heartEvent.emit('connected');
    console.info(`[mongoose] ${config.url} connected successfully`);
  });

  db.on('reconnected', () => {
    console.info(`[mongoose] ${config.url} reconnected successfully`);
  });

  loadSchema(ctx, db);
  loadModel(ctx, db);
};
