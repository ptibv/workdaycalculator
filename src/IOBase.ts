import path from 'path';
import fs from 'fs';

class IOBase {
  protected baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
  }

  protected assertValidPath(pathToCheck: string) {
    if (pathToCheck.length < this.baseDir.length) {
      throw Error('Invalid data requested');
    }

    if (!pathToCheck.startsWith(this.baseDir)) {
      throw Error('Invalid data requested');
    }
  }

  public isWritable(): boolean {
    try {
      fs.accessSync(this.baseDir, fs.constants.W_OK);

      return true;
    } catch (e) {
      // eslint-disable-next-line no-console -- Logging that base dir is not writable
      console.info(`Directory "${this.baseDir}" is not writable`);
    }
    return false;
  }
}

export default IOBase;
