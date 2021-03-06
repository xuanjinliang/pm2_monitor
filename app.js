const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');

const compress = require('koa-compress');
const sse = require('koa-sse-stream');

const index = require('./routes/index');
const users = require('./routes/users');
const sseRoutes = require('./routes/sse');

// error handler
onerror(app);

//使用gzip压缩
app.use(compress({threshold: 2048}));

// middlewares
app.use(sse({
  maxClients: 1000,
  pingInterval: 30000
}));

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(sseRoutes.routes(), sseRoutes.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;
