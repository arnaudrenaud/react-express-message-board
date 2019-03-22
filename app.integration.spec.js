const request = require('supertest');

const dataInterface = require('./data-interface');
const app = require('./app');
const agent = request.agent(app);

describe('app', () => {
  describe('when authenticated', () => {
    beforeEach(async () => {
      dataInterface.createMessage = jest.fn();

      await agent
        .post('/login')
        .send('username=randombrandon&password=randompassword');
    });

    describe('POST /messages', () => {
      describe('with non-empty content', () => {
        describe('with JavaScript code in personalWebsiteURL', () => {
          it('responds with error', async done => {
            const response = await agent
              .post('/messages')
              .send('content=&personalWebsiteURL=javascript:alert("Hacked")');

            expect(response.status).toEqual(400);
            expect(dataInterface.createMessage).toHaveBeenCalledTimes(0);
            done();
          });
        });

        describe('with HTTP URL in personalWebsiteURL', () => {
          it('responds with success', async done => {
            const response = await agent
              .post('/messages')
              .send('content=Hello&personalWebsiteURL=https://google.com');

            expect(response.status).toEqual(201);
            expect(dataInterface.createMessage).toHaveBeenCalledTimes(1);
            expect(dataInterface.createMessage).toHaveBeenCalledWith(
              'randombrandon',
              'Hello',
              'https://google.com'
            );
            done();
          });
        });
      });
    });
  });
});
