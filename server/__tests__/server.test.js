'use strict';
/**
 * Server smoke tests — basic API contract checks.
 * These run without a real DB (mocked). They verify that routes
 * exist, return expected HTTP codes, and app boots cleanly.
 *
 * Run: cd server && npm test
 */

const request = require('supertest');

// Mock mongoose before loading app so no real DB connection is made
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: { on: jest.fn() },
  };
});

// Mock all models to avoid real DB queries
jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/News', () => ({
  find: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }) }) }),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
}));

jest.mock('../src/models/Notification', () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }) }),
  create: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
  updateMany: jest.fn(),
}));

jest.mock('../src/models/CreditTransaction', () => ({
  find: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }) }) }) }),
  create: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockResolvedValue([]),
}));

// Mock cloudinary upload
jest.mock('../src/middlewares/upload', () => ({
  uploadMedia: (req, res, next) => { req.uploadedMedia = []; next(); },
  uploadSingle: (req, res, next) => next(),
}));

// Mock email sending
jest.mock('../src/utils/email', () => jest.fn().mockResolvedValue(true));

// Mock cron jobs
jest.mock('../src/jobs/weeklyContributor', () => () => {});
jest.mock('../src/jobs/monthlyContributor', () => () => {});

const app = require('../src/app');

describe('Server Health', () => {
  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
  });
});

describe('Auth Routes', () => {
  test('POST /api/auth/register — missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing name and password
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({}); // empty body
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/forgot-password — route exists', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'noone@test.com' });
    // Should return 200 (we don't reveal if email exists)
    expect([200, 400, 500]).toContain(res.status);
  });
});

describe('News Routes', () => {
  test('GET /api/news — returns 200', async () => {
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
  });

  test('POST /api/news/:id/report — unauthenticated returns 401', async () => {
    const res = await request(app)
      .post('/api/news/507f1f77bcf86cd799439011/report')
      .send({ reason: 'test' });
    expect(res.status).toBe(401);
  });
});

describe('Admin Routes', () => {
  test('GET /api/admin/submissions — unauthenticated returns 401', async () => {
    const res = await request(app).get('/api/admin/submissions');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/admin/submissions/:id/reject — unauthenticated returns 401', async () => {
    const res = await request(app)
      .patch('/api/admin/submissions/507f1f77bcf86cd799439011/reject')
      .send({ rejectionMessage: 'Test' });
    expect(res.status).toBe(401);
  });
});
