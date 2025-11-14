import opossum from 'opossum';

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 30000, // After 30 seconds, try again.
};

export const circuitBreaker = (action: (...args: any[]) => Promise<any>) => {
  const breaker = opossum(action, options);
  return breaker;
};
