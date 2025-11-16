import Session from "../models/Session.js";
import LoginAttempt from "../models/LoginAttempt.js";
import Exam from "../models/Exam.js";
import Payment from "../models/Payment.js";
import type { WidgetType } from "../types.js";

const CHART_COLORS = {
  primary: "hsl(221.2 83.2% 53.3%)",
  success: "hsl(142.1 76.2% 36.3%)",
  warning: "hsl(38 92% 50%)",
  danger: "hsl(0 84.2% 60.2%)",
  info: "hsl(199.4 95% 47.3%)",
  purple: "hsl(262.1 83.3% 57.8%)",
};

/**
 * activeAll Widget: Active sessions over time
 * Shows total active sessions grouped by week
 */
export async function getActiveAllData() {
  try {
    // Get active sessions (not expired)
    const now = new Date();
    const activeSessions = await Session.find({
      expiresAt: { $gte: now },
    }).sort({ createdAt: -1 });

    // Group sessions by week for the last 4 weeks
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeklyData = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: fourWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSessions: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 },
      },
      {
        $limit: 4,
      },
    ]);

    // Format data for chart
    const data = weeklyData.map((item, index) => ({
      name: `Week ${index + 1}`,
      "Total Sessions": item.totalSessions,
      "Active Now": index === weeklyData.length - 1 ? activeSessions.length : 0,
    }));

    // If no data, return mock structure
    if (data.length === 0) {
      return {
        series: ["Total Sessions", "Active Now"],
        data: [
          { name: "Week 1", "Total Sessions": 0, "Active Now": 0 },
        ],
      };
    }

    return {
      series: ["Total Sessions", "Active Now"],
      data,
    };
  } catch (error) {
    console.error("Error in getActiveAllData:", error);
    return {
      series: ["Total Sessions", "Active Now"],
      data: [{ name: "Week 1", "Total Sessions": 0, "Active Now": 0 }],
    };
  }
}

/**
 * historyAll Widget: Login attempts over time
 * Shows successful and failed login attempts by month
 */
export async function getHistoryAllData() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const loginData = await LoginAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$timestamp" },
            year: { $year: "$timestamp" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Group by month
    const monthMap = new Map();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    loginData.forEach((item) => {
      const monthKey = `${item._id.year}-${item._id.month}`;
      const monthName = monthNames[item._id.month - 1];

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { name: monthName, Success: 0, Failed: 0 });
      }

      const entry = monthMap.get(monthKey);
      if (item._id.status === "success") {
        entry.Success = item.count;
      } else if (item._id.status === "failed") {
        entry.Failed = item.count;
      }
    });

    const data = Array.from(monthMap.values());

    // If no data, return mock structure
    if (data.length === 0) {
      return {
        series: ["Success", "Failed"],
        data: [{ name: "Current", Success: 0, Failed: 0 }],
      };
    }

    return {
      series: ["Success", "Failed"],
      data,
    };
  } catch (error) {
    console.error("Error in getHistoryAllData:", error);
    return {
      series: ["Success", "Failed"],
      data: [{ name: "Current", Success: 0, Failed: 0 }],
    };
  }
}

/**
 * paidUnpaid Widget: Payment status distribution
 * Shows pie chart of paid vs unpaid
 */
export async function getPaidUnpaidData() {
  try {
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let paidCount = 0;
    let unpaidCount = 0;

    paymentStats.forEach((stat) => {
      if (stat._id === "paid") {
        paidCount = stat.count;
      } else if (stat._id === "unpaid" || stat._id === "pending") {
        unpaidCount += stat.count;
      }
    });

    const total = paidCount + unpaidCount;

    // If no data, return mock structure
    if (total === 0) {
      return {
        segments: [
          { name: "Paid", value: 0, color: CHART_COLORS.success },
          { name: "Unpaid", value: 0, color: CHART_COLORS.warning },
        ],
      };
    }

    return {
      segments: [
        { name: "Paid", value: paidCount, color: CHART_COLORS.success },
        { name: "Unpaid", value: unpaidCount, color: CHART_COLORS.warning },
      ],
    };
  } catch (error) {
    console.error("Error in getPaidUnpaidData:", error);
    return {
      segments: [
        { name: "Paid", value: 0, color: CHART_COLORS.success },
        { name: "Unpaid", value: 0, color: CHART_COLORS.warning },
      ],
    };
  }
}

/**
 * location Widget: Login attempts by country
 * Shows pie chart of login locations
 */
export async function getLocationData() {
  try {
    const locationStats = await LoginAttempt.aggregate([
      {
        $match: {
          "geo.country": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$geo.country",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // If no data, return mock structure
    if (locationStats.length === 0) {
      return {
        segments: [
          { name: "Unknown", value: 0, color: CHART_COLORS.info },
        ],
      };
    }

    const colors = [
      CHART_COLORS.info,
      CHART_COLORS.success,
      CHART_COLORS.warning,
      CHART_COLORS.purple,
      CHART_COLORS.danger,
    ];

    const segments = locationStats.map((stat, index) => ({
      name: stat._id || "Unknown",
      value: stat.count,
      color: colors[index % colors.length],
    }));

    return { segments };
  } catch (error) {
    console.error("Error in getLocationData:", error);
    return {
      segments: [
        { name: "Unknown", value: 0, color: CHART_COLORS.info },
      ],
    };
  }
}

/**
 * passFail Widget: Exam results distribution
 * Shows pie chart of pass vs fail
 */
export async function getPassFailData() {
  try {
    const examStats = await Exam.aggregate([
      {
        $group: {
          _id: "$result",
          count: { $sum: 1 },
        },
      },
    ]);

    let passCount = 0;
    let failCount = 0;

    examStats.forEach((stat) => {
      if (stat._id === "pass") {
        passCount = stat.count;
      } else if (stat._id === "fail") {
        failCount = stat.count;
      }
    });

    const total = passCount + failCount;

    // If no data, return mock structure
    if (total === 0) {
      return {
        segments: [
          { name: "Pass", value: 0, color: CHART_COLORS.success },
          { name: "Fail", value: 0, color: CHART_COLORS.danger },
        ],
      };
    }

    return {
      segments: [
        { name: "Pass", value: passCount, color: CHART_COLORS.success },
        { name: "Fail", value: failCount, color: CHART_COLORS.danger },
      ],
    };
  } catch (error) {
    console.error("Error in getPassFailData:", error);
    return {
      segments: [
        { name: "Pass", value: 0, color: CHART_COLORS.success },
        { name: "Fail", value: 0, color: CHART_COLORS.danger },
      ],
    };
  }
}

/**
 * proctoredOffline Widget: Exam type distribution
 * Shows pie chart of proctored vs offline exams
 */
export async function getProctoredOfflineData() {
  try {
    const examTypeStats = await Exam.aggregate([
      {
        $group: {
          _id: "$examType",
          count: { $sum: 1 },
        },
      },
    ]);

    let proctoredCount = 0;
    let offlineCount = 0;

    examTypeStats.forEach((stat) => {
      if (stat._id === "proctored") {
        proctoredCount = stat.count;
      } else if (stat._id === "offline") {
        offlineCount = stat.count;
      }
    });

    const total = proctoredCount + offlineCount;

    // If no data, return mock structure
    if (total === 0) {
      return {
        segments: [
          { name: "Proctored", value: 0, color: CHART_COLORS.primary },
          { name: "Offline", value: 0, color: CHART_COLORS.warning },
        ],
      };
    }

    return {
      segments: [
        { name: "Proctored", value: proctoredCount, color: CHART_COLORS.primary },
        { name: "Offline", value: offlineCount, color: CHART_COLORS.warning },
      ],
    };
  } catch (error) {
    console.error("Error in getProctoredOfflineData:", error);
    return {
      segments: [
        { name: "Proctored", value: 0, color: CHART_COLORS.primary },
        { name: "Offline", value: 0, color: CHART_COLORS.warning },
      ],
    };
  }
}

/**
 * Main function to get widget data by type
 */
export async function getWidgetDataByType(widgetType: WidgetType) {
  switch (widgetType) {
    case "activeAll":
      return await getActiveAllData();
    case "historyAll":
      return await getHistoryAllData();
    case "paidUnpaid":
      return await getPaidUnpaidData();
    case "location":
      return await getLocationData();
    case "passFail":
      return await getPassFailData();
    case "proctoredOffline":
      return await getProctoredOfflineData();
    default:
      return {
        series: [],
        data: [],
      };
  }
}
