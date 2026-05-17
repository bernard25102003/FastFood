import { getTestApp } from '../helpers/testApp';

describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const request = getTestApp();
    const res = await request.get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
    });
  });

  it('GET /nonexistent should return 404', async () => {
    const request = getTestApp();
    const res = await request.get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      code: 'NOT_FOUND',
    });
  });
});
