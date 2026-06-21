import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
  pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
  });

  pm.test('Response has items', function () {
    const response = pm.response.json();

    pm.expect(response).to.have.property('items');
    pm.expect(response).to.have.property('pagination');
  });
  pm.test('Status code is 400', function () {
    pm.response.to.have.status(400);
  });
});
