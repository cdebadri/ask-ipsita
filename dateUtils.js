(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DateUtils = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  // Given "today", finds the next Saturday (today counts if it IS Saturday)
  // and pairs it with the Sunday right after — that's "this weekend".
  // "The weekend after" is exactly 7 days later.
  function getUpcomingWeekends(today) {
    const day = today.getDay(); // 0 = Sun ... 6 = Sat
    const daysUntilSat = (6 - day + 7) % 7;
    const thisSat = addDays(today, daysUntilSat);
    const thisSun = addDays(thisSat, 1);
    const nextSat = addDays(thisSat, 7);
    const nextSun = addDays(thisSat, 8);
    return { thisSat, thisSun, nextSat, nextSun };
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return { addDays, getUpcomingWeekends, formatDate };
});
