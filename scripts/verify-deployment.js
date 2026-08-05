const http = require('http');

function request(method, path, body, cookie) {
    return new Promise((resolve, reject) => {
        const data = body ? new URLSearchParams(body).toString() : null;
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
                ...(cookie ? { Cookie: cookie } : {})
            }
        }, (res) => {
            let chunks = '';
            res.on('data', (c) => chunks += c);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: chunks }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function getCookie(setCookie) {
    if (!setCookie) return '';
    const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
    return arr.map(c => c.split(';')[0]).join('; ');
}

(async () => {
    const checks = [];

    // Public pages
    for (const path of ['/', '/login', '/register']) {
        const r = await request('GET', path);
        checks.push({ test: `GET ${path}`, ok: r.status === 200, status: r.status });
    }

    // Passenger login + RBAC
    const login = await request('POST', '/login', { email: 'passenger@airroute.com', password: 'Passenger123!' });
    const cookie = getCookie(login.headers['set-cookie']);
    checks.push({ test: 'Passenger login redirect', ok: login.status === 302, status: login.status });

    const passengerAdmin = await request('GET', '/admin', null, cookie);
    checks.push({ test: 'Passenger blocked from /admin', ok: passengerAdmin.status === 403, status: passengerAdmin.status });

    const profile = await request('GET', '/profile', null, cookie);
    checks.push({ test: 'Passenger profile', ok: profile.status === 200, status: profile.status });

    // Admin login + pages
    const adminLogin = await request('POST', '/login', { email: 'admin@airroute.com', password: 'Admin123!' });
    const adminCookie = getCookie(adminLogin.headers['set-cookie']);

    for (const path of ['/admin', '/admin/flights', '/admin/users', '/admin/reservations', '/admin/audit-logs']) {
        const r = await request('GET', path, null, adminCookie);
        checks.push({ test: `Admin ${path}`, ok: r.status === 200, status: r.status });
    }

    const audit = await request('GET', '/admin/audit-logs', null, adminCookie);
    checks.push({
        test: 'Audit trail has login entries',
        ok: audit.body.includes('Logged into the system'),
        status: audit.status
    });

    console.log(JSON.stringify(checks, null, 2));
    const failed = checks.filter(c => !c.ok);
    process.exit(failed.length ? 1 : 0);
})();
