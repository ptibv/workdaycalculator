import {
  beforeEach, afterEach, describe, expect, it, jest,
} from '@jest/globals';
import fs from 'fs';
import path from 'path';
import IOBase from '../src/IOBase';

describe('IOBase', () => {
  describe('assertValidatPath', () => {
    class IOBaseMock extends IOBase {
      public assertPath(pathToCheck: string) {
        return this.assertValidPath(pathToCheck);
      }
    }

    it('should assert invalid path length', () => {
      const ioMock = new IOBaseMock('config.example');

      let errorMessage;
      try {
        ioMock.assertPath('short');
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual('Invalid data requested');
    });

    it('should assert invalid path start', () => {
      const ioMock = new IOBaseMock('config.example');

      let errorMessage;
      try {
        ioMock.assertPath(
          // Make sure that the path is longer than the baseDir, but not the same
          `/different/root/${path.resolve('config.example')}/config.example/path/file.json`,
        );
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual('Invalid data requested');
    });

    it('should assert valid path', () => {
      const ioMock = new IOBaseMock('config.example');

      let errorMessage = 'no-errors';
      try {
        ioMock.assertPath(path.resolve('config.example/path/file.json'));
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual('no-errors');
    });
  });

  describe('isWritable', () => {
    beforeEach(() => {
      fs.mkdirSync(path.resolve('config.test/ioBase'), { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(path.resolve('config.test/ioBase'), { recursive: true, force: true });
    });

    it('should be writable', () => {
      const ioBase = new IOBase('config.test/ioBase');

      expect(ioBase.isWritable()).toBeTruthy();
    });

    it('should not be writable', () => {
      const ioBase = new IOBase('config.test/ioBase');
      jest.spyOn(fs, 'accessSync').mockImplementation(() => {
        throw Error('No writable');
      });

      expect(ioBase.isWritable()).toBeFalsy();
    });
  });
});
