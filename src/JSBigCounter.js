/*
 * Copyright (c) 2021 Anton Bagdatyev (Tonix)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

import Decimal from "@agrora/decimal";
import { MAX_SAFE_INTEGER } from "./constants";

/**
 * @type {string}
 */
const TAG = "JSBigCounterFymlE7h0SJuXzVzbKt1J";

export default class JSBigCounter {
  /**
   * Construct a new big counter.
   *
   * @param {number|number[]} initialValue The initial value (an integer greater than or equal to 0) or an array of integers greater than or equal to 0.
   *                                       A negative integer (less than 0) will be normalized to 0.
   */
  constructor(initialValue = 0) {
    let bigCounterArray;
    if (Object.prototype.hasOwnProperty.call(initialValue, "length")) {
      bigCounterArray = initialValue.map(value => (value >= 0 ? value : 0));
    } else {
      bigCounterArray = [initialValue >= 0 ? initialValue : 0];
    }
    this.bigCounterArray = bigCounterArray;

    if (!this.bigCounterArray.length) {
      this.bigCounterArray = [0];
    }

    if (
      this.bigCounterArray.length > 1 &&
      !this.bigCounterArray[this.bigCounterArray.length - 1]
    ) {
      this.bigCounterArray[this.bigCounterArray.length - 1] = 1;
    }
    this[TAG] = true;
  }

  /**
   * Increment the big counter by 1.
   *
   * @return {undefined}
   */
  increment() {
    let currentBucketPos = 0;
    while (this.bigCounterArray[currentBucketPos] === MAX_SAFE_INTEGER) {
      this.bigCounterArray[currentBucketPos] = 0;
      currentBucketPos++;
    }

    if (!this.bigCounterArray[currentBucketPos]) {
      this.bigCounterArray[currentBucketPos] = 0;
    }

    this.bigCounterArray[currentBucketPos]++;
  }

  /**
   * Decrement the big counter by 1.
   *
   * @return {undefined}
   */
  decrement() {
    if (this.bigCounterArray[0] > 0) {
      this.bigCounterArray[0]--;
    } else {
      if (this.bigCounterArray.length === 1) {
        // 0 is the minimum value of the big counter (no negative counters for now).
        return;
      }

      this.bigCounterArray[0] = MAX_SAFE_INTEGER;
      let currentBucketPos = 1;
      while (this.bigCounterArray[currentBucketPos] === 0) {
        this.bigCounterArray[currentBucketPos] = MAX_SAFE_INTEGER;
        currentBucketPos++;
      }
      this.bigCounterArray[currentBucketPos]--;
      const mostSignificantBucketPos = this.bigCounterArray.length - 1;
      if (
        currentBucketPos === mostSignificantBucketPos &&
        this.bigCounterArray[currentBucketPos] === 0
      ) {
        this.bigCounterArray.pop();
      }
    }
  }

  /**
   * Returns a string representing the integer value of the big counter.
   *
   * @return {string} The integer string representing the integer value of the big counter.
   */
  toString() {
    const baseDecimal = Decimal.from(MAX_SAFE_INTEGER).add(1);
    let basePowerDecimal = Decimal.from(baseDecimal);
    let decimal = Decimal.from(this.bigCounterArray[0]);
    for (let exponent = 1; exponent < this.bigCounterArray.length; exponent++) {
      const currentBucket = this.bigCounterArray[exponent];
      basePowerDecimal =
        exponent === 1
          ? basePowerDecimal
          : basePowerDecimal.multiply(baseDecimal);
      decimal = decimal.add(
        Decimal.from(currentBucket).multiply(basePowerDecimal)
      );
    }
    return decimal.toString();
  }

  /**
   * Compares this big counter with another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {number} The return value can be:
   *
   *                      - 1 if this big counter is greater than the given big counter;
   *                      - 0 if they are equal;
   *                      - 1 if this big counter is less than the given big counter;
   *
   */
  compareTo(bigCounter) {
    if (this === bigCounter) {
      return 0;
    }

    const l1 = this.bigCounterArray.length;
    const l2 = bigCounter.bigCounterArray.length;
    if (l1 > l2) {
      return 1;
    } else if (l2 > l1) {
      return -1;
    }

    for (let i = l1; i >= 0; i--) {
      const bucket1 = this.bigCounterArray[i];
      const bucket2 = bigCounter.bigCounterArray[i];
      if (bucket1 > bucket2) {
        return 1;
      } else if (bucket2 > bucket1) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * Tests whether this big counter is equal to another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {boolean} True this big counter is equal to the given big counter.
   */
  isEqualTo(bigCounter) {
    return this.compareTo(bigCounter) === 0;
  }

  /**
   * Tests whether this big counter is greater than another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {boolean} True this big counter is greater than the given big counter.
   */
  isGreaterThan(bigCounter) {
    return this.compareTo(bigCounter) > 0;
  }

  /**
   * Tests whether this big counter is less than another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {boolean} True this big counter is less than the given big counter.
   */
  isLessThan(bigCounter) {
    return this.compareTo(bigCounter) < 0;
  }

  /**
   * Tests whether this big counter is greater than or equal to another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {boolean} True this big counter is greater than or equal to the given big counter.
   */
  isGreaterThanOrEqualTo(bigCounter) {
    return this.isGreaterThan(bigCounter) || this.isEqualTo(bigCounter);
  }

  /**
   * Tests whether this big counter is less than or equal to another given big counter.
   *
   * @param {JSBigCounter} bigCounter Another big counter.
   * @return {boolean} True this big counter is less than or equal to the given big counter.
   */
  isLessThanOrEqualTo(bigCounter) {
    return this.isLessThan(bigCounter) || this.isEqualTo(bigCounter);
  }

  /**
   * Returns a copy of the internal big counter array used by this big counter.
   *
   * @return {number[]} A copy of the big counter array.
   */
  getBigCounterArrayCopy() {
    return [...this.bigCounterArray];
  }

  /**
   * Static method to serialize a big counter to JSON.
   *
   * @param {JSBigCounter} bigCounter A big counter.
   * @return {string} The JSON representing the given big counter.
   */
  static toJSON(bigCounter) {
    return JSON.stringify({ bigCounterArray: bigCounter.bigCounterArray });
  }

  /**
   * Static method to unserialize a big counter from its JSON representation.
   *
   * @param {string} json A big counter JSON representation, previously returned by `JSBigCounter.toJSON`.
   * @return {JSBigCounter} The unserialized big counter.
   */
  static fromJSON(json) {
    const parsed = JSON.parse(json);
    const bigCounter = new JSBigCounter();
    bigCounter.bigCounterArray = parsed.bigCounterArray;
    return bigCounter;
  }

  /**
   * Tests whether the parameter is a big counter.
   *
   * @param {*} maybeBigCounter A value that can be a big counter.
   * @return {boolean} True if the given value is a big counter, false otherwise.
   */
  static isBigCounter(maybeBigCounter) {
    return !!(maybeBigCounter && maybeBigCounter[TAG]);
  }
}
