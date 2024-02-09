const AWSMock = require('aws-sdk-mock');
const request = require('supertest');
const app = require('../server'); // Ensure paths correctly point to your server file
let server;
// Setup AWS S3 mocks before all tests
beforeAll(() => {
  server = app.listen(0, done); // Start the Express server if it's not already running
  AWSMock.mock('S3', 'getObject', (params, callback) => {
    // Mock for /historical-data endpoint
    if (params.Key === 'curred_data/historical/historical_data.json') {
      const sampleData = `{"date":${new Date().getTime()},"data":"Sample Data 1"}\n{"date":${new Date().getTime()},"data":"Sample Data 2"}`;
      callback(null, { Body: Buffer.from(sampleData) });
    }
    // Mock for /predictions endpoint
    else if (params.Key === 'output/test.json') {
      callback(null, { Body: JSON.stringify({ prediction: 'test prediction' }) });
    }
    else {
      callback(new Error('File not found'));
    }
  });
});

// Note: 'listObjectsV2' mock is removed as it might not be directly relevant to the test assertions made.

describe('API endpoints tests', () => {
  
  test('GET /historical-data should fetch historical data and return JSON with dates in "YYYY-MM-DD" format', async () => {
    const response = await request(app).get('/historical-data');
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach(item => {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('GET /predictions should return a list of predictions', async () => {
    const response = await request(app).get('/predictions');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

});
test('GET /api/v0/gen-data should return "Root Generation data" message', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ message: "Root Generation data" }));
  
  const response = await request(app).get('/api/v0/gen-data');

  expect(response.statusCode).toEqual(200);
  expect(response.body).toEqual({ message: "Root Generation data" });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    'https://4pjofaefviftewv7vuyuidevha0rylgc.lambda-url.eu-west-3.on.aws/api/v0/gen-data',
    {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    }
  );
});


// Restore AWS S3 mocks after all tests
afterAll(() => {
  AWSMock.restore('S3');
  server.close(done);
});