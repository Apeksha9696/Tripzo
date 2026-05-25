/**
 * Request Logging Middleware
 * Generates formatted, production-grade diagnostic logs for each request
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Hook response finish event to capture latency
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Log outline
    console.log(`[REQUEST] [${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Client: ${clientIp} - Latency: ${duration}ms`);
  });
  
  next();
};

module.exports = {
  requestLogger
};
