/**
 * Returns the start of a given month as a Date object.
 * @param {number} year
 * @param {number} month - 0-indexed (0 = January)
 */
const startOfMonth = (year, month) => new Date(year, month, 1, 0, 0, 0, 0);

/**
 * Returns the end of a given month as a Date object.
 */
const endOfMonth = (year, month) => new Date(year, month + 1, 0, 23, 59, 59, 999);

/**
 * Returns the start of the current week (Monday).
 */
const startOfCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

/**
 * Returns the last N months as an array of { year, month } objects (0-indexed months).
 */
const lastNMonths = (n = 6) => {
    const months = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return months;
};

/**
 * Formats a Date to "MMM YYYY" label, e.g. "Jan 2026"
 */
const formatMonthLabel = (year, month) => {
    const d = new Date(year, month, 1);
    return d.toLocaleString("default", { month: "short", year: "numeric" });
};

module.exports = {
    startOfMonth,
    endOfMonth,
    startOfCurrentWeek,
    lastNMonths,
    formatMonthLabel
};
