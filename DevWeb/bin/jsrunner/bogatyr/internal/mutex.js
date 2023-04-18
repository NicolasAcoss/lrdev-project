'use strict';

const locked = 1;
const unlocked = 0;

class Mutex {
  /**
   * Instantiate Mutex.
   */
  constructor(backingArray, backingDataArray) {
    this.backingArray = backingArray || new SharedArrayBuffer(8);
    this.backingDataArray = backingDataArray || new SharedArrayBuffer(2 * 4096); //each char will be represented by 2 bytes
    this.mutex = new Int32Array(this.backingArray);
    this.data = new Int16Array(this.backingDataArray);
  }

  /**
   * Instantiate a Mutex connected to the given one.
   * @param {Mutex} mutex the other Mutex.
   */
  static connect(mutex) {
    return new Mutex(mutex.backingArray, mutex.backingDataArray);
  }

  lock() {
    while (true) {
      if (Atomics.compareExchange(this.mutex, 0, unlocked, locked) === unlocked) {
        return;
      }
      Atomics.wait(this.mutex, 0, locked);
    }
  }

  lockRead() {
    while (true) {
      if (Atomics.compareExchange(this.mutex, 1, unlocked, locked) === unlocked) {
        return;
      }
      Atomics.wait(this.mutex, 1, locked);
    }
  }

  unlock() {
    if (Atomics.compareExchange(this.mutex, 0, locked, unlocked) !== locked) {
      throw new Error('Mutex is in inconsistent state: unlock on unlocked Mutex.');
    }
    Atomics.notify(this.mutex, 0, 1);
  }

  unlockRead() {
    if (Atomics.compareExchange(this.mutex, 1, locked, unlocked) !== locked) {
      throw new Error('Mutex is in inconsistent state: unlock on unlocked Mutex.');
    }
    Atomics.notify(this.mutex, 1, 1);
  }

  //Write into the data array from the data string starting at the startIndex. Return the total bytes written.
  //There is an assumption here that 00 is a valid termination byte pair.
  write(inputData, startIndex, resultObject) {
    let count = 0;
    for (let i = startIndex; i < inputData.length && count < this.data.length; i++) {
      this.data[count] = inputData.charCodeAt(i);
      count++;
    }
    if (count < this.data.length) { //We didn't fill the array so we need to write 0 at the last place.
      this.data[count] = 0;
    }
    resultObject.charsWritten = count;
    resultObject.eoln = (count < this.data.length);
  }

  //reads the data buffer into a string until 0 or end of buffer is reached
  read(resultObject) {
    const result = [];
    let foundEoln = false;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === 0) {
        foundEoln = true;
        break;
      }
      result.push(this.data[i]);
    }
    resultObject.charsRead = String.fromCharCode(...result);
    resultObject.eoln = foundEoln;
  }
}

class DualMutex {
  constructor(firstMutex, secondMutex) {
    this.firstMutex = (firstMutex && Mutex.connect(firstMutex)) || new Mutex();
    this.secondMutex = (secondMutex && Mutex.connect(secondMutex)) || new Mutex();
    this.useFirst = true;
    this.activeMutex = this.firstMutex;
  }

  static connect(dualMutex) {
    return new DualMutex(dualMutex.firstMutex, dualMutex.secondMutex);
  }

  lock() {
    return this.activeMutex.lock();
  }

  lockRead() {
    return this.activeMutex.lockRead();
  }

  lockOther() {
    if (this.useFirst) {
      return this.secondMutex.lock();
    } else {
      return this.firstMutex.lock();
    }
  }

  lockReadOther() {
    if (this.useFirst) {
      return this.secondMutex.lockRead();
    } else {
      return this.firstMutex.lockRead();
    }
  }

  unlock() {
    return this.activeMutex.unlock();
  }

  unlockRead() {
    return this.activeMutex.unlockRead();
  }

  unlockOther() {
    if (this.useFirst) {
      return this.secondMutex.unlock();
    } else {
      return this.firstMutex.unlock();
    }
  }

  flip() {
    this.useFirst = !this.useFirst;
    if (this.useFirst) {
      this.activeMutex = this.firstMutex;
    } else {
      this.activeMutex = this.secondMutex;
    }
  }

  write(inputData, startIndex, resultObject) {
    return this.activeMutex.write(inputData, startIndex, resultObject);
  }

  read(resultObject) {
    return this.activeMutex.read(resultObject);
  }
}

module.exports = {Mutex, DualMutex};
