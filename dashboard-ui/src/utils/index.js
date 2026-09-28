function parseDate(date) {
  return typeof date === "string" ? new Date(date) : date;
}
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function formatDate(date) {
  if (!date) return "N/A";
  const parsed = parseDate(date);
  if (!isValidDate(parsed)) return "Invalid date";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatDateTime(date) {
  if (!date) return "N/A";
  const parsed = parseDate(date);
  if (!isValidDate(parsed)) return "Invalid date";
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
function formatRelativeTime(date) {
  if (!date) return "N/A";
  const parsed = parseDate(date);
  if (!isValidDate(parsed)) return "Invalid date";
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffSec = Math.floor(diffMs / 1e3);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return formatDate(parsed);
}
function formatTime(date) {
  if (!date) return "N/A";
  const parsed = parseDate(date);
  if (!isValidDate(parsed)) return "Invalid date";
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}
function formatNumber(value) {
  if (value === null || value === void 0) return "N/A";
  return new Intl.NumberFormat().format(value);
}
function formatPercentage(value, decimals = 1) {
  if (value === null || value === void 0) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
function formatDuration(ms) {
  if (ms < 1e3) return `${ms}ms`;
  if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
  if (ms < 36e5) return `${Math.floor(ms / 6e4)}m ${Math.floor(ms % 6e4 / 1e3)}s`;
  return `${Math.floor(ms / 36e5)}h ${Math.floor(ms % 36e5 / 6e4)}m`;
}
function truncate(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function snakeToTitle(str) {
  if (!str) return "";
  return str.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function getSeverityColor(severity) {
  const colors = {
    CRITICAL: "text-red-500",
    HIGH: "text-orange-500",
    MEDIUM: "text-yellow-500",
    LOW: "text-blue-500",
    INFO: "text-gray-500"
  };
  return colors[severity] || colors.INFO;
}
function getSeverityBgColor(severity) {
  const colors = {
    CRITICAL: "bg-red-500/20",
    HIGH: "bg-orange-500/20",
    MEDIUM: "bg-yellow-500/20",
    LOW: "bg-blue-500/20",
    INFO: "bg-gray-500/20"
  };
  return colors[severity] || colors.INFO;
}
function getStatusColor(status) {
  const colors = {
    HEALTHY: "text-green-500",
    ACTIVE: "text-green-500",
    COMPLETED: "text-green-500",
    WARNING: "text-yellow-500",
    PENDING: "text-yellow-500",
    IN_PROGRESS: "text-blue-500",
    CRITICAL: "text-red-500",
    FAILED: "text-red-500",
    UNKNOWN: "text-gray-500",
    OFFLINE: "text-gray-500"
  };
  return colors[status] || colors.UNKNOWN;
}
function isEmpty(value) {
  if (value === null || value === void 0) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
function safeJsonParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...groups[groupKey] || [], item]
    };
  }, {});
}
function sortBy(array, ...keys) {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
    }
    return 0;
  });
}
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
function throttle(fn, limit) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
export {
  capitalize,
  debounce,
  formatBytes,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  formatTime,
  generateId,
  getSeverityBgColor,
  getSeverityColor,
  getStatusColor,
  groupBy,
  isEmpty,
  safeJsonParse,
  snakeToTitle,
  sortBy,
  throttle,
  truncate
};
