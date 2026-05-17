import { createApp } from '../../src/main';
import supertest from 'supertest';

export const getTestApp = () => {
  const app = createApp();
  return supertest(app);
};
