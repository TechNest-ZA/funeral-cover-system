// Local-only reverse proxy for testing.
//
// Right now the marketing site (static HTML, port 5178) and the React app
// (port 5177) are two separate dev servers, so a link from one to the other
// only works if they share an origin. In real production they WILL share one
// domain (marketing pages at the root, the app under /join, /admin, /book) -
// this proxy just makes that true locally too, so testing behaves the same
// way the real site will. Nothing here ships to production.

const http = require('http');
const httpProxy = require('http-proxy');

const APP_PORT = 5177; // React app (Vite dev server)
const MARKETING_PORT = 5178; // static marketing site (Python http.server)
const PROXY_PORT = 5179;

// Routes the app itself, plus every path prefix Vite's dev server uses
// internally (its module graph, the HMR client, dependency pre-bundling).
// The static marketing site never requests any of these - it only ever asks
// for its own .html/.css files - so a plain prefix match is unambiguous and
// doesn't need to track which page originated the request.
const APP_PATH_PREFIXES = [
  '/join', '/admin', '/book',
  '/src', '/@vite', '/@react-refresh', '/@id', '/@fs', '/node_modules',
];

const proxy = httpProxy.createProxyServer({ ws: true });
proxy.on('error', (err, _req, res) => {
  console.error('[dev-proxy] upstream error:', err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Dev proxy: upstream server is not running. Check the frontend (5177) and marketing site (5178) servers.');
  }
});

function matchesAppPrefix(pathname) {
  return APP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}

function targetPortFor(req) {
  const url = req.url || '/';
  const pathname = url.split('?')[0];
  return matchesAppPrefix(pathname) ? APP_PORT : MARKETING_PORT;
}

const server = http.createServer((req, res) => {
  req.socket.on('error', () => {}); // browser cancelled the request mid-flight - harmless
  const target = `http://localhost:${targetPortFor(req)}`;
  proxy.web(req, res, { target });
});

server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => {}); // same, for websocket upgrades (Vite's HMR client)
  const target = `http://localhost:${targetPortFor(req)}`;
  proxy.ws(req, socket, head, { target });
});

// A client (browser) disconnecting mid-request surfaces as an unhandled
// 'error' event on a raw socket somewhere inside Node/http-proxy's plumbing
// rather than through proxy.on('error', ...) above. Without this, Node's
// default behaviour is to crash the whole process on the first page reload.
process.on('uncaughtException', (err) => {
  if (err && err.code === 'ECONNRESET') return;
  console.error('[dev-proxy] uncaught exception:', err);
});

server.listen(PROXY_PORT, () => {
  console.log(`Guardian Cover (combined, dev-only) running on http://localhost:${PROXY_PORT}`);
  console.log(`  -> marketing site proxied from :${MARKETING_PORT}`);
  console.log(`  -> app (/join, /admin, /book) proxied from :${APP_PORT}`);
});
