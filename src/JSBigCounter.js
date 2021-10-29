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

export default class JSBigCounter {
  constructor(initialValue = 0) {
    this.bigCounterArray = [initialValue >= 0 ? initialValue : 0];
  }

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

  compareTo(bigCounter) {
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

  static toJSON(bigCounter) {
    return JSON.stringify({ bigCounterArray: bigCounter.bigCounterArray });
  }

  static fromJSON(json) {
    const parsed = JSON.parse(json);
    const bigCounter = new JSBigCounter();
    bigCounter.bigCounterArray = parsed.bigCounterArray;
    return bigCounter;
  }
}
