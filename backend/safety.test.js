// Isolated route tests: no server socket, credentials, or real database is used.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const safety = require('./safety');

function harness(steps = []) {
  const routes = new Map();
  const calls = [];
  const notifications = [];
  const db = {
    async query(sql, params) {
      const text = sql.replace(/\s+/g, ' ').trim();
      calls.push({ text, params });
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(text) || text.includes('pg_advisory_xact_lock')) return { rows: [] };
      const step = steps.shift();
      assert.ok(step, `Unexpected query: ${text}`);
      assert.match(text, step.match);
      if (step.params) assert.deepEqual(Array.from(params), step.params);
      step.inspect?.(text, params);
      if (step.error) throw step.error;
      return { rows: step.rows || [] };
    },
    async connect() { return db; },
    release() { calls.push({ text: 'RELEASE' }); },
  };
  const app = { use() {}, listen() {} };
  for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
    app[method] = (route, ...handlers) => routes.set(`${method} ${route}`, handlers);
  }
  const express = () => app;
  express.json = () => () => {};
  const modules = {
    dotenv: { config() {} }, express, cors: () => () => {}, './db': db, './safety': safety,
    './notifications': { notificationService: () => ({ createNotification: (...args) => notifications.push(args), registerRoutes() {} }) },
    bcryptjs: {}, jsonwebtoken: { verify(token) { if (token !== 'valid') throw Error(); return { id: '1' }; } },
    './google-auth': { createGoogleAuthHandler: () => () => {} },
    './profile-photos': { registerPhotoRoutes() {} }, resend: { Resend: class {} },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8'), {
    require(name) { assert.ok(name in modules, name); return modules[name]; },
    process: { env: { JWT_SECRET: 'test-only' } }, console: { log() {}, error() {} },
  });
  return {
    calls, notifications, routes,
    async request(method, route, { params = {}, body = {}, query = {}, authenticated = true } = {}) {
      const req = { params, body, query, headers: authenticated ? { authorization: 'Bearer valid' } : {} };
      const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; return this; } };
      const handlers = routes.get(`${method} ${route}`);
      assert.ok(handlers, route);
      let allowed = false;
      handlers[0](req, res, () => { allowed = true; });
      if (allowed) await handlers[1](req, res);
      assert.equal(steps.length, 0, 'All expected queries must run');
      // Query assertions inside route catch blocks must never be mistaken for a successful test.
      return res;
    },
  };
}

const userTarget = { match: /SELECT id FROM users/, rows: [{ id: '2' }] };
const jobTarget = { match: /SELECT id, posted_by_id FROM jobs/, rows: [{ id: '9', posted_by_id: '2' }] };
const relation = blocked => ({ match: /SELECT EXISTS .*blocker_id = \$1 AND blocked_user_id = \$2.*blocker_id = \$2 AND blocked_user_id = \$1/, rows: [{ blocked }] });
const application = status => ({ match: /FROM applications/, rows: [{ id: '8', applicant_id: '1', posted_by_id: '2', status }] });

test('every safety route rejects unauthenticated requests', async () => {
  for (const [method, route] of [['post', '/api/reports/users/:targetId'], ['post', '/api/reports/jobs/:targetId'], ['get', '/api/blocks'], ['post', '/api/blocks/:userId'], ['delete', '/api/blocks/:userId']]) {
    const h = harness();
    assert.equal((await h.request(method, route, { authenticated: false })).statusCode, 401);
    assert.equal(h.calls.length, 0);
  }
});

for (const type of ['user', 'job']) {
  const route = `/api/reports/${type}s/:targetId`;
  const reason = type === 'user' ? 'harassment' : 'unsafe_work';
  const target = type === 'user' ? userTarget : jobTarget;
  test(`report ${type} uses authenticated identity and does not notify`, async () => {
    const h = harness([target, { match: /INSERT INTO reports.*ON CONFLICT DO NOTHING/, params: ['1', type, type === 'user' ? '2' : null, type === 'job' ? '2' : null, reason, 'Details'], rows: [{ id: '10' }] }]);
    const result = await h.request('post', route, { params: { targetId: '2' }, body: { reason, details: ' Details ', reporter_id: '999' } });
    assert.equal(result.statusCode, 201);
    assert.equal(h.notifications.length, 0);
  });
  test(`duplicate ${type} report is friendly`, async () => {
    const h = harness([target, { match: /INSERT INTO reports/, rows: [] }]);
    const result = await h.request('post', route, { params: { targetId: '2' }, body: { reason } });
    assert.equal(result.statusCode, 200);
    assert.equal(result.data.alreadyReported, true);
    assert.match(result.data.message, /already reported/);
  });
  test(`cannot report own ${type}`, async () => {
    const h = harness([{ ...target, rows: [{ id: '1', posted_by_id: '1' }] }]);
    assert.equal((await h.request('post', route, { params: { targetId: '1' }, body: { reason } })).statusCode, 400);
  });
  test(`${type} report validates target, reason, details and missing records`, async () => {
    for (const [targetId, body] of [['invalid', { reason }], ['2', { reason: 'invalid' }], ['2', { reason, details: 'x'.repeat(501) }], ['2', { reason, details: {} }]]) {
      assert.equal((await harness().request('post', route, { params: { targetId }, body })).statusCode, 400);
    }
    assert.equal((await harness([{ ...target, rows: [] }]).request('post', route, { params: { targetId: '2' }, body: { reason } })).statusCode, 404);
  });
}

test('block is atomic, scoped to both directions and pending applications only', async () => {
  const h = harness([userTarget, { match: /INSERT INTO user_blocks.*ON CONFLICT DO NOTHING/, params: ['1', '2'], rows: [{ id: '1' }] }, {
    match: /UPDATE applications a SET status = 'rejected'/, params: ['1', '2'],
    inspect(sql) {
      assert.match(sql, /a.status = 'pending'/);
      assert.match(sql, /a.applicant_id = \$1::bigint AND j.posted_by_id = \$2::bigint::text/);
      assert.match(sql, /a.applicant_id = \$2::bigint AND j.posted_by_id = \$1::bigint::text/);
    },
  }]);
  const result = await h.request('post', '/api/blocks/:userId', { params: { userId: '2' }, body: { blocker_id: '999' } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(h.calls.slice(0, 2).map(call => call.text), ['BEGIN', 'SELECT pg_advisory_xact_lock(73190421)']);
  assert.deepEqual(h.calls.slice(-2).map(call => call.text), ['COMMIT', 'RELEASE']);
  assert.equal(h.notifications.length, 0);
});

test('duplicate block is graceful', async () => {
  const h = harness([userTarget, { match: /INSERT INTO user_blocks/ }, { match: /UPDATE applications/ }]);
  assert.match((await h.request('post', '/api/blocks/:userId', { params: { userId: '2' } })).data.message, /already blocked/);
});

test('failed pending rejection rolls back block and hides database error', async () => {
  const h = harness([userTarget, { match: /INSERT INTO user_blocks/, rows: [{ id: '1' }] }, { match: /UPDATE applications/, error: Error('private database detail') }]);
  const result = await h.request('post', '/api/blocks/:userId', { params: { userId: '2' } });
  assert.equal(result.statusCode, 500);
  assert.doesNotMatch(result.data.message, /private database/);
  assert.deepEqual(h.calls.slice(-2).map(call => call.text), ['ROLLBACK', 'RELEASE']);
});

test('self block and invalid/missing target are rejected', async () => {
  for (const userId of ['1', '-2', '9223372036854775808']) {
    assert.equal((await harness().request('post', '/api/blocks/:userId', { params: { userId } })).statusCode, 400);
  }
  assert.equal((await harness([{ ...userTarget, rows: [] }]).request('post', '/api/blocks/:userId', { params: { userId: '2' } })).statusCode, 404);
});

test('unblock deletes only caller-owned block and never restores applications', async () => {
  const h = harness([userTarget, { match: /^DELETE FROM user_blocks WHERE blocker_id = \$1 AND blocked_user_id = \$2$/, params: ['1', '2'] }]);
  assert.equal((await h.request('delete', '/api/blocks/:userId', { params: { userId: '2' } })).data.message, 'User unblocked.');
  assert.equal(h.notifications.length, 0);
});

test('blocked list projects safe fields and only caller-owned blocks', async () => {
  const h = harness([{ match: /^SELECT u.id AS user_id, u.name, u.profile_picture_url, b.created_at .*WHERE b.blocker_id = \$1/, params: ['1'], rows: [{ user_id: '2', name: 'Member' }] }]);
  const result = await h.request('get', '/api/blocks');
  assert.equal(result.statusCode, 200);
  assert.doesNotMatch(h.calls[0].text, /email|phone/);
});

test('apply across a block is denied before insert', async () => {
  const h = harness([{ match: /SELECT \* FROM jobs.*FOR UPDATE/, rows: [{ id: '9', posted_by_id: '2' }] }, relation(true)]);
  const result = await h.request('post', '/api/jobs/:id/apply', { params: { id: '9' } });
  assert.equal(result.statusCode, 403);
  assert.equal(result.data.message, 'This work is not available for interaction.');
  assert.ok(h.calls.some(call => call.text === 'ROLLBACK'));
});

for (const status of ['accepted', 'completed']) {
  test(`${status} history stays readable while new messages are denied`, async () => {
    const h = harness([application(status), relation(true)]);
    const result = await h.request('post', '/api/applications/:id/messages', { params: { id: '8' }, body: { message: 'Hello' } });
    assert.equal(result.statusCode, 403);
    assert.equal(result.data.message, 'Messaging is unavailable for this conversation.');
    assert.equal(h.notifications.length, 0);
    const history = harness([application(status), { match: /FROM messages/, rows: [{ id: '4', message: 'Historical message' }] }]);
    const read = await history.request('get', '/api/applications/:id/messages', { params: { id: '8' } });
    assert.equal(read.statusCode, 200);
    assert.equal(read.data[0].message, 'Historical message');
  });
  test(`${status} contact is hidden on public profile across either block direction`, async () => {
    const h = harness([
      { match: /FROM users/, rows: [{ id: '2', name: 'Member', email: 'private@example.test', phone: 'private' }] },
      { match: /FROM applications/, rows: [{ status, posted_by_id: '1' }] }, relation(true),
      { match: /SELECT 1 FROM user_blocks WHERE blocker_id = \$1/, rows: [] },
    ]);
    const result = await h.request('get', '/api/users/:id/profile', { params: { id: '2' }, query: { jobId: '9' } });
    assert.equal(result.statusCode, 200);
    assert.equal(result.data.email, null);
    assert.equal(result.data.phone, null);
    assert.equal(result.data.canViewContact, false);
    assert.equal(result.data.blockedByMe, false);
  });
}

test('blocked application cannot be accepted through status endpoint', async () => {
  const h = harness([
    { match: /FOR UPDATE OF jobs/, rows: [{ id: '9', posted_by_id: '1' }] },
    { match: /FROM applications/, rows: [{ id: '8', applicant_id: '2', posted_by_id: '1', status: 'rejected' }] }, relation(true),
  ]);
  assert.equal((await h.request('patch', '/api/applications/:id/status', { params: { id: '8' }, body: { status: 'accepted' } })).statusCode, 403);
});

test('applicants and my applications mask contacts in the SQL projection', async () => {
  const h = harness([
    { match: /SELECT \* FROM jobs/, rows: [{ posted_by_id: '1' }] },
    { match: /AND NOT EXISTS .*b.blocker_id = \$2 AND b.blocked_user_id = users.id.*b.blocker_id = users.id AND b.blocked_user_id = \$2/, params: ['9', '1'] },
  ]);
  assert.equal((await h.request('get', '/api/jobs/:id/applicants', { params: { id: '9' } })).statusCode, 200);
  const mine = harness([{ match: /AND NOT EXISTS .*THEN poster.email.*AND NOT EXISTS .*THEN poster.phone/, params: ['1'] }]);
  assert.equal((await mine.request('get', '/api/my-applications')).statusCode, 200);
});

test('unblocked participants can still apply and send messages', async () => {
  const apply = harness([
    { match: /SELECT \* FROM jobs.*FOR UPDATE/, rows: [{ id: '9', posted_by_id: '2', title: 'Work' }] },
    relation(false), { match: /FROM applications.*status IN/ }, { match: /FROM applications.*applicant_id/ },
    { match: /INSERT INTO applications/, rows: [{ id: '8', status: 'pending' }] },
  ]);
  assert.equal((await apply.request('post', '/api/jobs/:id/apply', { params: { id: '9' } })).statusCode, 201);
  const chat = harness([application('accepted'), relation(false), { match: /INSERT INTO messages/, rows: [{ id: '5', message: 'Hello' }] }]);
  assert.equal((await chat.request('post', '/api/applications/:id/messages', { params: { id: '8' }, body: { message: 'Hello' } })).statusCode, 201);
  assert.ok(chat.calls.some(call => call.text === 'COMMIT'));
});

test('a stranger cannot read historical messages', async () => {
  const h = harness([{ match: /FROM applications/, rows: [{ id: '8', applicant_id: '3', posted_by_id: '2', status: 'accepted' }] }]);
  assert.equal((await h.request('get', '/api/applications/:id/messages', { params: { id: '8' } })).statusCode, 403);
});

test('existing accepted work can still be completed after blocking', async () => {
  const h = harness([
    { match: /FOR UPDATE OF jobs/, rows: [{ id: '9', posted_by_id: '1' }] },
    { match: /FROM applications/, rows: [{ id: '8', applicant_id: '2', posted_by_id: '1', status: 'accepted' }] },
    { match: /UPDATE applications/, params: ['completed', '8'], rows: [{ id: '8', status: 'completed' }] },
  ]);
  assert.equal((await h.request('patch', '/api/applications/:id/status', { params: { id: '8' }, body: { status: 'completed' } })).statusCode, 200);
});

test('contact remains available for accepted work when neither user has blocked', async () => {
  const h = harness([
    { match: /FROM users/, rows: [{ id: '2', email: 'member@example.test', phone: '123' }] },
    { match: /FROM applications/, rows: [{ status: 'accepted', posted_by_id: '1' }] }, relation(false),
    { match: /SELECT 1 FROM user_blocks/, rows: [] },
  ]);
  const result = await h.request('get', '/api/users/:id/profile', { params: { id: '2' }, query: { jobId: '9' } });
  assert.equal(result.statusCode, 200);
  assert.equal(result.data.canViewContact, true);
  assert.equal(result.data.email, 'member@example.test');
});
