import {
  afterAll, beforeAll, describe, expect, it, jest,
} from '@jest/globals';
import fs from 'fs';
import path from 'path';
import Config from '../src/Config';
import DiskCache from '../src/DiskCache';
import Workdays from '../src/Workdays';

describe('Config', () => {
  const cacheGetMock = jest.fn();
  const cacheGetConfigMock = jest.fn();
  const cacheWriteMock = jest.fn();

  const cacheMock = {
    get: cacheGetMock,
    getConfig: cacheGetConfigMock,
    write: cacheWriteMock,
  };
  const workdays = new Workdays(cacheMock as unknown as DiskCache);
  const workdaysFlushSpy = jest.spyOn(workdays, 'flush');
  const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');

  beforeAll(() => {
    fs.cpSync('config.example', 'config.test', { recursive: true, force: true });
  });

  afterAll(() => {
    fs.rmSync('config.test', { recursive: true, force: true });
  });

  describe('Get config', () => {
    it('should read config.test/nl.json', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');
      const config = baseConfig.get('nl');

      expect(config.zone).toEqual('nl');
    });

    it('should not read /config/nl.json', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays);

      let errorMessage;
      try {
        baseConfig.get('nl');
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toEqual('The config for ref "nl" could not be found');
    });
  });

  describe('Write config', () => {
    afterAll(() => {
      fs.rmSync(path.resolve('config.test/new-nl.json'));
    });

    it('should write config', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');

      const config = baseConfig.get('nl');
      baseConfig.write('new-nl', config);
      expect(fs.existsSync(path.resolve('config.test', 'new-nl.json'))).toBeTruthy();
      expect(cacheWriteMock).toBeCalled();
      expect(workdaysFlushSpy).toBeCalledWith('new-nl');
    });

    it('should not write when read-only, but should update cache', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');
      jest.spyOn(baseConfig, 'isWritable').mockImplementation(() => false);

      const config = baseConfig.get('nl');
      baseConfig.write('should-not-exist', config);
      expect(fs.existsSync(path.resolve('config.test', 'should-not-exist.json'))).toBeFalsy();
      expect(cacheWriteMock).toBeCalled();
      expect(workdaysFlushSpy).toBeCalledWith('should-not-exist');
    });
  });

  describe('Regenerate cache', () => {
    it('should write new config', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');

      expect(baseConfig.regenerateCache()).toBeTruthy();
      expect(cacheWriteMock).toBeCalled();
      expect(workdaysFlushSpy).toBeCalledWith('nl');
      expect(writeFileSyncSpy).toBeCalledWith(path.resolve('config.test/nl.json'), expect.anything());
    });

    it('Should not write new config', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');

      cacheGetConfigMock.mockImplementation(() => JSON.parse(fs.readFileSync(path.resolve('config.test/nl.json')).toString()));

      expect(baseConfig.regenerateCache()).toBeTruthy();
      expect(cacheGetConfigMock).toBeCalledWith('nl');
      expect(cacheWriteMock).not.toBeCalled();
      expect(workdaysFlushSpy).not.toBeCalled();
      expect(writeFileSyncSpy).not.toBeCalled();
    });

    it('should return false when there is an error', () => {
      const baseConfig = new Config(cacheMock as unknown as DiskCache, workdays, 'config.test');

      cacheWriteMock.mockImplementation(() => { throw Error('Error writing to cache!'); });

      expect(baseConfig.regenerateCache()).toBeFalsy();
    });
  });
});
