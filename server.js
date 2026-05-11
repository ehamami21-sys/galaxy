const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// CORS headers
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

server.use(middlewares);

// Rewrite routes for better API
server.use(jsonServer.rewriter({
    '/api/projects': '/projects',
    '/api/projects/:id': '/projects/:id',
    '/api/settings': '/settings',
    '/api/*': '/$1'
}));

server.use(router);

const PORT = 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`📦 API endpoints:`);
    console.log(`   GET    /api/projects       - دریافت همه پروژه‌ها`);
    console.log(`   GET    /api/projects/:id   - دریافت یک پروژه`);
    console.log(`   POST   /api/projects       - افزودن پروژه`);
    console.log(`   PUT    /api/projects/:id   - ویرایش پروژه`);
    console.log(`   DELETE /api/projects/:id   - حذف پروژه`);
    console.log(`   GET    /api/settings       - دریافت تنظیمات`);
});