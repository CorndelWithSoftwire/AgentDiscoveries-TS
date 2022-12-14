import request from 'supertest'
import app from '../app'
import { Knex } from 'knex'
import createDbConnection from '../db'
import { Express } from 'express'
import { User } from '../models/user'

let db: Knex
let server: Express

describe('The new user route', () => {
  beforeEach(async () => {
    db = createDbConnection()
    await db.migrate.latest()
    await db.seed.run()
    server = app({ db })
  })

  afterEach(async () => {
    await db.destroy()
  })

  it('Returns 200 when successful', async () => {
    const loginResponse = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ username: 'admin', password: 'password' }))

    const response = await request(server)
      .post('/user/')
      .set('Content-Type', 'application/json')
      .set('Cookie', loginResponse.get('Set-Cookie'))
      .send(JSON.stringify({ username: 'new-user', password: 'password' }))
    expect(response.statusCode).toBe(200)
  })

  it('Creates a new user', async () => {
    const loginResponse = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ username: 'admin', password: 'password' }))

    await request(server)
      .post('/user/')
      .set('Content-Type', 'application/json')
      .set('Cookie', loginResponse.get('Set-Cookie'))
      .send(JSON.stringify({ username: 'new-user', password: 'password' }))

    const [{ userId }] = await db
      .select('userId')
      .from<User>('users')
      .where({ username: 'new-user' })
    expect(userId).toBeTruthy()
  })
})

describe('The login route', () => {
  beforeAll(async () => {
    db = createDbConnection()
    await db.migrate.latest()
    await db.seed.run()
    server = app({ db })
  })

  afterAll(() => {
    db.destroy()
  })
  it('Returns 200 when successful', async () => {
    const response = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({ username: 'test_user', password: 'password' }),
      )
    expect(response.statusCode).toBe(200)
  })

  it('Returns the username when successful', async () => {
    const response = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({ username: 'test_user', password: 'password' }),
      )
    expect(response.body).toEqual({ username: 'test_user' })
  })

  it('Sets session when successful', async () => {
    const response = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({ username: 'test_user', password: 'password' }),
      )
    expect(response.get('Set-Cookie')).toContainEqual(
      expect.stringMatching('connect.sid'),
    )
  })

  it('Returns 400 when unsuccessful', async () => {
    const response = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          username: 'test_user',
          password: 'wrong-password',
        }),
      )
    expect(response.statusCode).toBe(400)
  })
  it('Does not set session when unsuccessful', async () => {
    const response = await request(server)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          username: 'test_user',
          password: 'wrong-password',
        }),
      )
    expect(response.get('Set-Cookie')).toBeUndefined()
  })
})
