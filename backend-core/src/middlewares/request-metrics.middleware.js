const { performance } = require('node:perf_hooks');

let requestCount = 0;
let serverErrorCount = 0;
let totalResponseTime = 0;

const trackRequest = (req, res, next) => {
  const startedAt = performance.now();
  res.once('finish', () => {
    requestCount += 1;
    totalResponseTime += performance.now() - startedAt;
    if (res.statusCode >= 500) serverErrorCount += 1;
  });
  next();
};

const getSnapshot = () => {
  const memory = process.memoryUsage();
  return {
    uptime_seconds: Math.floor(process.uptime()),
    requests: requestCount,
    server_errors: serverErrorCount,
    average_response_ms: requestCount
      ? Math.round(totalResponseTime / requestCount * 10) / 10
      : 0,
    rss_megabytes: Math.round(memory.rss / 1024 / 1024 * 10) / 10
  };
};

module.exports = { trackRequest, getSnapshot };
