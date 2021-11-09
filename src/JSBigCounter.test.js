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

import JSBigCounter from "./JSBigCounter";
import Decimal from "@agrora/decimal";

test("constructor works", () => {
  let bigCounter = new JSBigCounter();
  expect(bigCounter.bigCounterArray).toEqual([0]);

  bigCounter = new JSBigCounter(0);
  expect(bigCounter.bigCounterArray).toEqual([0]);

  bigCounter = new JSBigCounter(1);
  expect(bigCounter.bigCounterArray).toEqual([1]);

  bigCounter = new JSBigCounter(2);
  expect(bigCounter.bigCounterArray).toEqual([2]);

  bigCounter = new JSBigCounter(3);
  expect(bigCounter.bigCounterArray).toEqual([3]);

  bigCounter = new JSBigCounter(100);
  expect(bigCounter.bigCounterArray).toEqual([100]);

  bigCounter = new JSBigCounter(32189380921);
  expect(bigCounter.bigCounterArray).toEqual([32189380921]);

  bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  expect(bigCounter.bigCounterArray).toEqual([Number.MAX_SAFE_INTEGER]);

  bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER - 39);
  expect(bigCounter.bigCounterArray).toEqual([Number.MAX_SAFE_INTEGER - 39]);

  bigCounter = new JSBigCounter(-123);
  expect(bigCounter.bigCounterArray).toEqual([0]);

  bigCounter = new JSBigCounter(-1);
  expect(bigCounter.bigCounterArray).toEqual([0]);

  bigCounter = new JSBigCounter([1, 2, 3]);
  expect(bigCounter.bigCounterArray).toEqual([1, 2, 3]);

  bigCounter = new JSBigCounter([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);
  expect(bigCounter.bigCounterArray).toEqual([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);

  bigCounter = new JSBigCounter([0, 1, 3, 0]);
  expect(bigCounter.bigCounterArray).toEqual([0, 1, 3, 1]);

  bigCounter = new JSBigCounter([0, 1, 3, -2]);
  expect(bigCounter.bigCounterArray).toEqual([0, 1, 3, 1]);

  bigCounter = new JSBigCounter([]);
  expect(bigCounter.bigCounterArray).toEqual([0]);
});

test("increment works", () => {
  const bigCounter = new JSBigCounter();
  bigCounter.increment();
  expect(bigCounter.bigCounterArray).toEqual([1]);
});

test("increment several times works", () => {
  const bigCounter = new JSBigCounter();
  bigCounter.increment(); // + 1
  bigCounter.increment(); // + 2
  bigCounter.increment(); // + 3
  bigCounter.increment(); // + 4
  bigCounter.increment(); // + 5
  expect(bigCounter.bigCounterArray).toEqual([5]);
});

test("increment with carrying works", () => {
  const bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  bigCounter.increment();
  expect(bigCounter.bigCounterArray).toEqual([0, 1]);
});

test("increment with carrying several times works", () => {
  const bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  bigCounter.increment(); // + 1
  bigCounter.increment(); // + 2
  bigCounter.increment(); // + 3
  expect(bigCounter.bigCounterArray).toEqual([2, 1]);
});

test("decrement works", () => {
  const initialValue = 2;
  const bigCounter = new JSBigCounter(initialValue);
  bigCounter.decrement(); // - 1
  expect(bigCounter.bigCounterArray).toEqual([initialValue - 1]);
});

test("decrement when counter is 0 keeps the counter at 0", () => {
  const bigCounter = new JSBigCounter();
  bigCounter.decrement();
  expect(bigCounter.bigCounterArray).toEqual([0]);
});

test("decrement several times when counter is 0 keeps the counter at 0", () => {
  const bigCounter = new JSBigCounter();
  bigCounter.decrement();
  bigCounter.decrement();
  bigCounter.decrement();
  bigCounter.decrement();
  bigCounter.decrement();
  bigCounter.decrement();
  expect(bigCounter.bigCounterArray).toEqual([0]);
});

test("decrement several times works", () => {
  const bigCounter = new JSBigCounter(682101);
  bigCounter.decrement(); // - 1
  bigCounter.decrement(); // - 2
  bigCounter.decrement(); // - 3
  bigCounter.decrement(); // - 4
  bigCounter.decrement(); // - 5
  expect(bigCounter.bigCounterArray).toEqual([682101 - 5]);
});

test("decrement with carrying works", () => {
  const bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  bigCounter.increment(); // + 1
  bigCounter.increment(); // + 2
  bigCounter.increment(); // + 3
  bigCounter.decrement(); // - 1
  bigCounter.decrement(); // - 2
  bigCounter.decrement(); // - 3
  expect(bigCounter.bigCounterArray).toEqual([Number.MAX_SAFE_INTEGER]);
});

test("decrement with several carrying works", () => {
  let bigCounter = new JSBigCounter([0, 0, 0, 1]);
  bigCounter.decrement(); // - 1
  expect(bigCounter.bigCounterArray).toEqual([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);

  bigCounter = new JSBigCounter([0, 0, 0, 2]);
  bigCounter.decrement(); // - 1
  expect(bigCounter.bigCounterArray).toEqual([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    1,
  ]);
});

test("toString works", () => {
  let bigCounter = new JSBigCounter();
  expect(bigCounter.toString()).toEqual("0");

  bigCounter = new JSBigCounter(1);
  expect(bigCounter.toString()).toEqual("1");

  bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  bigCounter.increment();
  expect(bigCounter.toString()).toEqual(
    Decimal.from(Number.MAX_SAFE_INTEGER).add(1).toString()
  );

  bigCounter = new JSBigCounter(Number.MAX_SAFE_INTEGER);
  bigCounter.increment(); // + 1
  bigCounter.increment(); // + 2
  bigCounter.increment(); // + 3
  bigCounter.increment(); // + 4
  bigCounter.increment(); // + 5
  bigCounter.increment(); // + 6
  bigCounter.increment(); // + 7
  expect(bigCounter.toString()).toEqual(
    Decimal.from(Number.MAX_SAFE_INTEGER).add(7).toString()
  );

  const value = [
    321789, // 0
    382190, // 1
    947392, // 2
    3, // 3
    3209, // 4
    Number.MAX_SAFE_INTEGER, // 5
    17, // 6
  ];
  bigCounter = new JSBigCounter(value);
  const baseDecimal = Decimal.from(Number.MAX_SAFE_INTEGER).add(1);
  expect(bigCounter.toString()).toEqual(
    Decimal.from(value[0])
      .add(Decimal.from(value[1]).multiply(baseDecimal))
      .add(Decimal.from(value[2]).multiply(baseDecimal).multiply(baseDecimal))
      .add(
        Decimal.from(value[3])
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
      )
      .add(
        Decimal.from(value[4])
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
      )
      .add(
        Decimal.from(value[5])
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
      )
      .add(
        Decimal.from(value[6])
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
          .multiply(baseDecimal)
      )
      .toString()
  );
});

test("compareTo works", () => {
  let bigCounter1 = new JSBigCounter([0, 0, 0, 1]);
  let bigCounter2 = new JSBigCounter([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);
  expect(bigCounter1.compareTo(bigCounter2)).toBeGreaterThan(0);
  expect(bigCounter2.compareTo(bigCounter1)).toBeLessThan(0);
  bigCounter2.increment();
  expect(bigCounter1.compareTo(bigCounter2)).toEqual(0);
  expect(bigCounter2.compareTo(bigCounter1)).toEqual(0);

  bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  bigCounter2 = new JSBigCounter([4, 3, 2, 1]);
  expect(bigCounter1.compareTo(bigCounter2)).toBeGreaterThan(0);
  expect(bigCounter2.compareTo(bigCounter1)).toBeLessThan(0);

  bigCounter1 = new JSBigCounter([9, 8, 3290, 321890]);
  bigCounter2 = new JSBigCounter([9, 8, 3290, 321890]);
  expect(bigCounter2.compareTo(bigCounter1)).toEqual(0);
  expect(bigCounter1.compareTo(bigCounter2)).toEqual(0);

  bigCounter1 = new JSBigCounter();
  bigCounter2 = bigCounter1;
  expect(bigCounter2.compareTo(bigCounter1)).toEqual(0);
  expect(bigCounter1.compareTo(bigCounter2)).toEqual(0);

  bigCounter1 = new JSBigCounter([9, 8, 3290, 321890, 2, 3]);
  bigCounter2 = new JSBigCounter([9, 8, 3290, 321890, 1, 1, 3]);
  expect(bigCounter2.compareTo(bigCounter1)).toEqual(1);
  expect(bigCounter1.compareTo(bigCounter2)).toEqual(-1);
});

test("isEqualTo works", () => {
  let bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  let bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isEqualTo(bigCounter2)).toBe(true);
  expect(bigCounter2.isEqualTo(bigCounter1)).toBe(true);

  bigCounter1 = new JSBigCounter();
  bigCounter2 = bigCounter1;
  expect(bigCounter1.isEqualTo(bigCounter2)).toBe(true);
  expect(bigCounter2.isEqualTo(bigCounter1)).toBe(true);

  bigCounter1 = new JSBigCounter([1, 2, 0, 4]);
  bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isEqualTo(bigCounter2)).toBe(false);
  expect(bigCounter2.isEqualTo(bigCounter1)).toBe(false);
});

test("isGreaterThan works", () => {
  let bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  let bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isGreaterThan(bigCounter2)).toBe(false);
  expect(bigCounter2.isGreaterThan(bigCounter1)).toBe(false);

  bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  bigCounter2 = new JSBigCounter([1, 2, 0, 4]);
  expect(bigCounter1.isGreaterThan(bigCounter2)).toBe(true);
  expect(bigCounter2.isGreaterThan(bigCounter1)).toBe(false);
});

test("isLessThan works", () => {
  let bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  let bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isLessThan(bigCounter2)).toBe(false);
  expect(bigCounter2.isLessThan(bigCounter1)).toBe(false);

  bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  bigCounter2 = new JSBigCounter([1, 2, 0, 4]);
  expect(bigCounter1.isLessThan(bigCounter2)).toBe(false);
  expect(bigCounter2.isLessThan(bigCounter1)).toBe(true);
});

test("isGreaterThanOrEqualTo works", () => {
  let bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  let bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isGreaterThanOrEqualTo(bigCounter2)).toBe(true);
  expect(bigCounter2.isGreaterThanOrEqualTo(bigCounter1)).toBe(true);

  bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  bigCounter2 = new JSBigCounter([1, 2, 0, 4]);
  expect(bigCounter1.isGreaterThanOrEqualTo(bigCounter2)).toBe(true);
  expect(bigCounter2.isGreaterThanOrEqualTo(bigCounter1)).toBe(false);
});

test("isLessThanOrEqualTo works", () => {
  let bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  let bigCounter2 = new JSBigCounter([1, 2, 3, 4]);
  expect(bigCounter1.isLessThanOrEqualTo(bigCounter2)).toBe(true);
  expect(bigCounter2.isLessThanOrEqualTo(bigCounter1)).toBe(true);

  bigCounter1 = new JSBigCounter([1, 2, 3, 4]);
  bigCounter2 = new JSBigCounter([1, 2, 0, 4]);
  expect(bigCounter1.isLessThanOrEqualTo(bigCounter2)).toBe(false);
  expect(bigCounter2.isLessThanOrEqualTo(bigCounter1)).toBe(true);
});

test("toJSON works", () => {
  let bigCounter = new JSBigCounter([1, 2, 3, 4]);
  expect(JSBigCounter.toJSON(bigCounter)).toEqual(
    JSON.stringify({ bigCounterArray: [1, 2, 3, 4] })
  );

  bigCounter = new JSBigCounter();
  expect(JSBigCounter.toJSON(bigCounter)).toEqual(
    JSON.stringify({ bigCounterArray: [0] })
  );
});

test("fromJSON works", () => {
  const arr = [1, 2, 3, 4];
  let bigCounter = new JSBigCounter([...arr]);
  let json = JSBigCounter.toJSON(bigCounter);
  let parsed = JSBigCounter.fromJSON(json);
  expect(parsed.bigCounterArray).toEqual([...arr]);
  expect(parsed.isEqualTo(new JSBigCounter(arr))).toBe(true);

  bigCounter = new JSBigCounter([
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);
  bigCounter.increment();
  json = JSBigCounter.toJSON(bigCounter);
  parsed = JSBigCounter.fromJSON(json);
  expect(parsed.bigCounterArray).toEqual([0, 0, 0, 0, 0, 1]);
  expect(parsed.isEqualTo(new JSBigCounter([0, 0, 0, 0, 0, 1]))).toBe(true);
});

test("getBigCounterArrayCopy works", () => {
  const bigCounter = new JSBigCounter([5, 89, 78, Number.MAX_SAFE_INTEGER, 2]);
  expect(bigCounter.getBigCounterArrayCopy()).toEqual([
    5,
    89,
    78,
    Number.MAX_SAFE_INTEGER,
    2,
  ]);
});

test("getBigCounterArrayCopy indeed returns a copy", () => {
  const bigCounter = new JSBigCounter([5, 89, 78, Number.MAX_SAFE_INTEGER, 2]);
  expect(bigCounter.getBigCounterArrayCopy()).not.toBe([
    5,
    89,
    78,
    Number.MAX_SAFE_INTEGER,
    2,
  ]);
});

test("isBigCounter works", () => {
  const bigCounter = new JSBigCounter([5, 89, 78, Number.MAX_SAFE_INTEGER, 2]);
  expect(JSBigCounter.isBigCounter(bigCounter)).toBe(true);
  expect(JSBigCounter.isBigCounter([])).toBe(false);
  expect(JSBigCounter.isBigCounter({})).toBe(false);
  expect(JSBigCounter.isBigCounter(123)).toBe(false);
});

test("copy works", () => {
  const bigCounter = new JSBigCounter([5, 89, 78, Number.MAX_SAFE_INTEGER, 2]);
  const bigCounterCopy = bigCounter.copy();
  expect(bigCounterCopy.bigCounterArray).toEqual([
    5,
    89,
    78,
    Number.MAX_SAFE_INTEGER,
    2,
  ]);
  expect(bigCounter).toBe(bigCounter);
  expect(bigCounterCopy).not.toBe(bigCounter);
});

test("getBigCounterArray works", () => {
  const bigCounter = new JSBigCounter([5, 89, 78, Number.MAX_SAFE_INTEGER, 2]);
  expect(bigCounter.getBigCounterArray()).toBe(bigCounter.bigCounterArray);
});

test("big counter can be constructed from another big counter", () => {
  const bigCounter = new JSBigCounter([1, 2, 3, 4]);
  const anotherBigCounter = new JSBigCounter(bigCounter);
  expect(anotherBigCounter.isEqualTo(bigCounter)).toBe(true);
  expect(anotherBigCounter.isEqualTo(bigCounter)).toBe(true);
  expect(anotherBigCounter).not.toBe(bigCounter);
  expect(anotherBigCounter.getBigCounterArray()).not.toBe(
    bigCounter.getBigCounterArray()
  );
});
