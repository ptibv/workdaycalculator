import {
  describe, beforeAll, it, jest, expect, beforeEach, test,
} from '@jest/globals';
import express, { Express } from 'express';
import request from 'supertest';
import { Settings } from 'luxon';
import Workdays from '../src/Workdays';
import DiskCache from '../src/DiskCache';
import registerRoutes from '../src/middleware/registerRoutes';
import Config from '../src/Config';
import ConfigInterface from '../src/interfaces/ConfigInterface';
import generate from '../src/lib/generate';
import handleFailures from '../src/middleware/handleFailures';
import ConfigNotFoundError from '../src/errors/ConfigNotFoundError';

const configsToTestWith: { [key: string]: ConfigInterface } = {
  nl: {
    zone: 'nl',
    workdays: [
      1,
      2,
      3,
      4,
      5,
    ],
    numberOfYears: 10,
    exclude: [],
    excludeHolidays: [],
  },
  be: {
    zone: 'be',
    workdays: [
      1,
      2,
      3,
      4,
      5,
    ],
    numberOfYears: 10,
    exclude: [],
    excludeHolidays: [],
  },
};

const holidayList = [
  { date: '2021-01-01', ref: 'nl' },
  { date: '2021-04-04', ref: 'nl' },
  { date: '2021-04-05', ref: 'nl' },
  { date: '2021-04-27', ref: 'nl' },
  { date: '2021-05-13', ref: 'nl' },
  { date: '2021-05-23', ref: 'nl' },
  { date: '2021-05-24', ref: 'nl' },
  { date: '2021-12-25', ref: 'nl' },
  { date: '2021-12-26', ref: 'nl' },
  { date: '2022-01-01', ref: 'nl' },
  { date: '2022-04-17', ref: 'nl' },
  { date: '2022-04-18', ref: 'nl' },
  { date: '2022-04-27', ref: 'nl' },
  { date: '2022-05-26', ref: 'nl' },
  { date: '2022-06-05', ref: 'nl' },
  { date: '2022-06-06', ref: 'nl' },
  { date: '2022-12-25', ref: 'nl' },
  { date: '2022-12-26', ref: 'nl' },
  { date: '2023-01-01', ref: 'nl' },
  { date: '2023-04-09', ref: 'nl' },
  { date: '2023-04-10', ref: 'nl' },
  { date: '2023-04-27', ref: 'nl' },
  { date: '2023-05-18', ref: 'nl' },
  { date: '2023-05-28', ref: 'nl' },
  { date: '2023-05-29', ref: 'nl' },
  { date: '2023-12-25', ref: 'nl' },
  { date: '2023-12-26', ref: 'nl' },
  { date: '2024-01-01', ref: 'nl' },
  { date: '2024-03-31', ref: 'nl' },
  { date: '2024-04-01', ref: 'nl' },
  { date: '2024-04-27', ref: 'nl' },
  { date: '2024-05-09', ref: 'nl' },
  { date: '2024-05-19', ref: 'nl' },
  { date: '2024-05-20', ref: 'nl' },
  { date: '2024-12-25', ref: 'nl' },
  { date: '2024-12-26', ref: 'nl' },
  { date: '2025-01-01', ref: 'nl' },
  { date: '2025-04-20', ref: 'nl' },
  { date: '2025-04-21', ref: 'nl' },
  { date: '2025-04-27', ref: 'nl' },
  { date: '2025-05-29', ref: 'nl' },
  { date: '2025-06-08', ref: 'nl' },
  { date: '2025-06-09', ref: 'nl' },
  { date: '2025-12-25', ref: 'nl' },
  { date: '2025-12-26', ref: 'nl' },
  { date: '2025-05-05', ref: 'nl' },
  { date: '2021-01-01', ref: 'be' },
  { date: '2021-04-05', ref: 'be' },
  { date: '2021-05-01', ref: 'be' },
  { date: '2021-05-13', ref: 'be' },
  { date: '2021-05-24', ref: 'be' },
  { date: '2021-07-21', ref: 'be' },
  { date: '2021-08-15', ref: 'be' },
  { date: '2021-11-01', ref: 'be' },
  { date: '2021-11-11', ref: 'be' },
  { date: '2021-12-25', ref: 'be' },
  { date: '2022-01-01', ref: 'be' },
  { date: '2022-04-18', ref: 'be' },
  { date: '2022-05-01', ref: 'be' },
  { date: '2022-05-26', ref: 'be' },
  { date: '2022-06-06', ref: 'be' },
  { date: '2022-07-21', ref: 'be' },
  { date: '2022-08-15', ref: 'be' },
  { date: '2022-11-01', ref: 'be' },
  { date: '2022-11-11', ref: 'be' },
  { date: '2022-12-25', ref: 'be' },
  { date: '2023-01-01', ref: 'be' },
  { date: '2023-04-10', ref: 'be' },
  { date: '2023-05-01', ref: 'be' },
  { date: '2023-05-18', ref: 'be' },
  { date: '2023-05-29', ref: 'be' },
  { date: '2023-07-21', ref: 'be' },
  { date: '2023-08-15', ref: 'be' },
  { date: '2023-11-01', ref: 'be' },
  { date: '2023-11-11', ref: 'be' },
  { date: '2023-12-25', ref: 'be' },
  { date: '2024-01-01', ref: 'be' },
  { date: '2024-04-01', ref: 'be' },
  { date: '2024-05-01', ref: 'be' },
  { date: '2024-05-09', ref: 'be' },
  { date: '2024-05-20', ref: 'be' },
  { date: '2024-07-21', ref: 'be' },
  { date: '2024-08-15', ref: 'be' },
  { date: '2024-11-01', ref: 'be' },
  { date: '2024-11-11', ref: 'be' },
  { date: '2024-12-25', ref: 'be' },
  { date: '2025-01-01', ref: 'be' },
  { date: '2025-04-21', ref: 'be' },
  { date: '2025-05-01', ref: 'be' },
  { date: '2025-05-29', ref: 'be' },
  { date: '2025-06-09', ref: 'be' },
  { date: '2025-07-21', ref: 'be' },
  { date: '2025-08-15', ref: 'be' },
  { date: '2025-11-01', ref: 'be' },
  { date: '2025-11-11', ref: 'be' },
  { date: '2025-12-25', ref: 'be' },
];

describe('e2e', () => {
  let app: Express;
  const configReadMock = jest.fn();
  const configWriteMock = jest.fn();
  const configIsWritable = jest.fn();
  const cacheGetMock = jest.fn();
  const cacheGetConfigMock = jest.fn();

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const configMock = {
      get: configReadMock,
      write: configWriteMock,
      isWritable: configIsWritable,
    };
    const cacheMock = {
      get: cacheGetMock,
      getConfig: cacheGetConfigMock,
    };
    const workDays = new Workdays(cacheMock as unknown as DiskCache);
    registerRoutes(app, workDays, configMock as unknown as Config);
    handleFailures(app);
  });

  beforeEach(() => {
    Settings.now = () => new Date(2020, 0, 1).valueOf();
    cacheGetMock.mockImplementation(
      (ref: string) => generate(configsToTestWith[ref] as unknown as ConfigInterface),
    );
    cacheGetConfigMock.mockImplementation(
      (ref: string) => configsToTestWith[ref],
    );
    configReadMock.mockImplementation((ref: string) => configsToTestWith[ref]);
  });

  describe('GET: /v1/:ref/isWorkday/:date', () => {
    test.each(holidayList)('should return false for $date', async ({ date, ref }: { date: string, ref: string }) => {
      const response = await request(app)
        .get(`/v1/${ref}/isWorkday/${date}`)
        .send();

      expect(response.body.status).toEqual('SUCCESS');
      expect(response.body.result).toEqual(false);
    });

    it('should return true for 2020-01-02', async () => {
      const response = await request(app)
        .get('/v1/nl/isWorkday/2020-01-02')
        .send();

      expect(response.body.status).toEqual('SUCCESS');
      expect(response.body.result).toEqual(true);
    });
  });

  describe('GET /v1/:ref/addWorkdays/:date/:add', () => {
    test.each([
      {
        // 4/5/11/12 weekend
        date: '2020-01-02', add: 10, expected: '2020-01-16', ref: 'nl',
      },
      {
        // 25 kerst, 26/27/2/3/9/10 weekend
        date: '2020-12-24', add: 10, expected: '2021-01-11', ref: 'nl',
      },
      {
        // 01-01 nieuwjaar, 2/3/9/10 weekend
        date: '2020-12-30', add: 10, expected: '2021-01-14', ref: 'nl',
      },
      {
        // 27 is koningsdag in nl
        date: '2021-04-26', add: 1, expected: '2021-04-28', ref: 'nl',
      },
      {
        // no koningsdag in be
        date: '2021-04-26', add: 1, expected: '2021-04-27', ref: 'be',
      },
    ])('should return $expected after adding $add days to $date', async ({
      date, add, expected, ref,
    }: { date: string, add: number, expected: string, ref: string }) => {
      const response = await request(app)
        .get(`/v1/${ref}/addWorkdays/${date}/${add}`)
        .send();

      expect(response.body.status).toEqual('SUCCESS');
      expect(response.body.result).toEqual(expected);
    });

    it('should return failed after trying to get a date outside of the cache', async () => {
      const response = await request(app)
        .get('/v1/nl/addWorkdays/1980-01-01/10')
        .send();

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('1980-01-01T00:00:00.000Z was not found in the cache');
    });
  });

  describe('GET /v1/:ref/config', () => {
    test.each([
      { ref: 'nl', result: configsToTestWith.nl },
      { ref: 'be', result: configsToTestWith.be },
    ])('should return proper config for $ref', async ({ ref, result }: { ref: string, result: unknown }) => {
      const response = await request(app)
        .get(`/v1/${ref}/config`)
        .send();

      expect(response.body.status).toEqual('SUCCESS');
      expect(response.body.result).toEqual(result);
    });

    it('should handle invalid ref', async () => {
      configReadMock.mockImplementation(() => {
        throw new ConfigNotFoundError('The config for ref xyz could not be found');
      });

      const response = await request(app)
        .get('/v1/xyz/config')
        .send();

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('The config for ref xyz could not be found');
    });
  });

  describe('PUT /v1/:ref/config', () => {
    test.each([
      { ref: 'nl', config: configsToTestWith.nl },
      { ref: 'be', config: configsToTestWith.be },
    ])('should return proper config for $ref', async ({ ref, config }: { ref: string, config: unknown }) => {
      configIsWritable.mockImplementation(() => true);
      const response = await request(app)
        .put(`/v1/${ref}/config`)
        .send(config as unknown as object);

      expect(configWriteMock).toBeCalledWith(ref, config);
      expect(response.body.status).toEqual('SUCCESS');
    });

    it('should not write the config when baseDir is not writable', async () => {
      const config = configsToTestWith.nl;
      configIsWritable.mockImplementation(() => false);

      const response = await request(app)
        .put('/v1/nl/config')
        .send(config as unknown as object);

      expect(configWriteMock).not.toBeCalled();
      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('Config is read-only');
    });
  });

  describe('GET /v1/holidays/:zone', () => {
    test.each([
      { zone: 'nl', result: ['nieuwjaar', 'eerste paasdag', 'tweede paasdag', 'koningsdag', 'hemelvaartsdag', 'eerste pinksterdag', 'tweede pinksterdag', 'eerste kerstdag', 'tweede kerstdag', 'bevrijdingsdag'] },
      { zone: 'be', result: ['nieuwjaarsdag', 'paasmaandag', 'dag van de arbeid', 'O.H. Hemelvaart', 'pinkstermaandag', 'nationale feestdag', 'O.L.V hemelvaart', 'allerheiligen', 'wapenstilstand', 'eerste kerstdag'] },
    ])('should return correct holidays for zone $zone', async ({ zone, result }: { zone: string, result: string[] }) => {
      const response = await request(app)
        .get(`/v1/holidays/${zone}`)
        .send();

      expect(response.body.status).toEqual('SUCCESS');
      expect(response.body.result).toEqual(result);
    });
  });

  describe('Validate error handling', () => {
    it('Invalid workday request', async () => {
      const response = await request(app)
        .get('/v1/nl/isWorkday/invalid-date')
        .send();

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('"date" must be a valid date');
      expect(response.statusCode).toEqual(500);
    });

    it('Invalid put config request', async () => {
      const config = configsToTestWith.nl;
      configIsWritable.mockImplementation(() => {
        throw Error('Error!');
      });

      const response = await request(app)
        .put('/v1/nl/config')
        .send(config as unknown as object);

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('Er is iets misgegaan');
      expect(response.statusCode).toEqual(500);
    });

    it('Invalid zone request', async () => {
      const response = await request(app)
        .get('/v1/holidays/fr')
        .send();

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('Zone fr not found');
      expect(response.statusCode).toEqual(500);
    });

    it('should return a 404', async () => {
      const response = await request(app)
        .get('/invalid/path')
        .send();

      expect(response.body.status).toEqual('FAILED');
      expect(response.body.error).toEqual('invalid endpoint');
      expect(response.statusCode).toEqual(404);
    });
  });
});
