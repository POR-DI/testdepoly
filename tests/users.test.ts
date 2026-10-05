import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { AddressInfo } from 'node:net';
import { app } from '../src/app';
import User from '../src/User';

type UserDocument = InstanceType<typeof User>;
type UserInput = { name: string; email: string; password: string };

test('Users API: CRUD, password privacy, validation and database failures', async (t) => {
  const records = new Map<string, UserDocument>();
  t.mock.method(User, 'create', async (data: UserInput) => {
    if ([...records.values()].some(user => user.email === data.email)) throw { code: 11000 };
    const user = new User(data);
    records.set(String(user._id), user);
    return user;
  });
  const findMock = t.mock.method(User, 'find', async () => [...records.values()]);
  t.mock.method(User, 'findById', async (id: string) => records.get(id) || null);
  t.mock.method(User, 'findByIdAndUpdate', async (id: string, update: { $set: Partial<UserInput> }) => {
    const user = records.get(id);
    if (!user) return null;
    Object.assign(user, update.$set);
    return user;
  });
  t.mock.method(User, 'findByIdAndDelete', async (id: string) => {
    const user = records.get(id); records.delete(id); return user || null;
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = async (method: string, path = '', body?: Record<string, unknown>) => {
    const response = await fetch(base + '/api/users' + path, {
      method, headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await fetch(base + '/test.html')).status, 200);
  assert.equal((await request('POST', '', {})).status, 400);
  assert.equal((await request('POST', '', {name:'A',email:'bad',password:'secret'})).status, 400);
  const created = await request('POST', '', { name: 'A', email: 'a@example.com', password: 'secret', admin: true });
  assert.equal(created.status, 201);
  assert.equal(created.body.password, undefined);
  assert.equal(created.body.admin, undefined);
  const id = created.body._id;
  const oldHash = records.get(id)!.password!;
  assert.ok(typeof oldHash === 'string');
  assert.match(oldHash, /^scrypt:/);
  assert.notEqual(oldHash, 'secret');
  assert.equal((await request('POST', '', { name: 'B', email: 'a@example.com', password: 'secret' })).status, 409);
  const list = await request('GET');
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].password, undefined);
  assert.equal((await request('GET', '/' + id)).body.name, 'A');
  const updated = await request('PUT', '/' + id, { name: 'Changed', password: 'new-password', $unset: { email: 1 } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, 'Changed');
  assert.equal(updated.body.email, 'a@example.com');
  assert.equal(updated.body.password, undefined);
  assert.notEqual(records.get(id)!.password!, oldHash);
  assert.equal((await request('PUT', '/' + id, { name: '' })).status, 400);
  for (const method of ['GET','PUT','DELETE']) {
    assert.equal((await request(method, '/invalid', method === 'PUT' ? {name:'A'} : undefined)).status, 400);
    assert.equal((await request(method, '/000000000000000000000000', method === 'PUT' ? {name:'A'} : undefined)).status, 404);
  }
  assert.equal((await request('DELETE', '/' + id)).status, 200);
  assert.equal((await request('GET')).body.length, 0);
  findMock.mock.mockImplementation(async () => { throw new Error('private database details'); });
  const failed = await request('GET');
  assert.equal(failed.status, 500);
  assert.equal(JSON.stringify(failed.body).includes('private'), false);
  const invalid = await fetch(base + '/api/users', {method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
  assert.equal(invalid.status,400);
  assert.equal((await invalid.json()).message,'Invalid JSON body');
});
