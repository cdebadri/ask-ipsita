const test = require("node:test");
const assert = require("node:assert/strict");
const { addDays, getUpcomingWeekends, formatDate } = require("../dateUtils.js");

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

test("addDays advances the calendar date without touching time-of-day drift", () => {
  const start = new Date(2026, 8, 1); // Sep 1, 2026 (Tue)
  assert.equal(ymd(addDays(start, 0)), "2026-09-01");
  assert.equal(ymd(addDays(start, 1)), "2026-09-02");
  assert.equal(ymd(addDays(start, 29)), "2026-09-30");
  assert.equal(ymd(addDays(start, 30)), "2026-10-01"); // month rollover
});

test("addDays rolls over a year boundary correctly", () => {
  const start = new Date(2025, 11, 30); // Dec 30, 2025
  assert.equal(ymd(addDays(start, 1)), "2025-12-31");
  assert.equal(ymd(addDays(start, 2)), "2026-01-01");
});

// day-of-week -> expected offset (in days) from "today" to "this Saturday"
const EXPECTED_OFFSETS = {
  0: 6, // Sunday -> next Saturday is 6 days out
  1: 5, // Monday
  2: 4, // Tuesday
  3: 3, // Wednesday
  4: 2, // Thursday
  5: 1, // Friday
  6: 0, // Saturday -> today
};

for (const [dow, offset] of Object.entries(EXPECTED_OFFSETS)) {
  test(`getUpcomingWeekends: day-of-week ${dow} maps to a Saturday ${offset} day(s) out`, () => {
    // Find a concrete date in Sep 2026 with this day-of-week to use as "today".
    let probe = new Date(2026, 8, 1);
    while (probe.getDay() !== Number(dow)) probe = addDays(probe, 1);

    const { thisSat, thisSun, nextSat, nextSun } = getUpcomingWeekends(probe);

    assert.equal(thisSat.getDay(), 6, "thisSat must land on a Saturday");
    assert.equal(thisSun.getDay(), 0, "thisSun must land on a Sunday");
    assert.equal(nextSat.getDay(), 6, "nextSat must land on a Saturday");
    assert.equal(nextSun.getDay(), 0, "nextSun must land on a Sunday");

    assert.equal(ymd(thisSat), ymd(addDays(probe, offset)));
    assert.equal(ymd(thisSun), ymd(addDays(probe, offset + 1)));
    assert.equal(ymd(nextSat), ymd(addDays(probe, offset + 7)));
    assert.equal(ymd(nextSun), ymd(addDays(probe, offset + 8)));
  });
}

test("getUpcomingWeekends: the four dates are strictly increasing and never in the past", () => {
  const today = new Date(2026, 8, 1);
  const { thisSat, thisSun, nextSat, nextSun } = getUpcomingWeekends(today);

  assert.ok(thisSat.getTime() >= today.getTime());
  assert.ok(thisSun.getTime() > thisSat.getTime());
  assert.ok(nextSat.getTime() > thisSun.getTime());
  assert.ok(nextSun.getTime() > nextSat.getTime());
});

test("getUpcomingWeekends: 'this weekend' can span a month boundary", () => {
  // Aug 27, 2026 is a Thursday; the following Saturday falls in September.
  const today = new Date(2026, 7, 27);
  const { thisSat, nextSun } = getUpcomingWeekends(today);
  assert.equal(ymd(thisSat), "2026-08-29");
  assert.equal(ymd(nextSun), "2026-09-06");
});

test("formatDate produces a deterministic, human-readable label", () => {
  const date = new Date(2026, 8, 5); // Sep 5, 2026 (Saturday)
  assert.equal(formatDate(date), "Sat, Sep 5");
});

test("formatDate labels stay unique across the four generated weekend options", () => {
  const today = new Date(2026, 8, 1);
  const { thisSat, thisSun, nextSat, nextSun } = getUpcomingWeekends(today);
  const labels = [thisSat, thisSun, nextSat, nextSun].map(formatDate);
  assert.equal(new Set(labels).size, 4, "all four date labels must be distinct");
});
