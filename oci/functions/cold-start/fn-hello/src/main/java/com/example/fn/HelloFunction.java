package com.example.fn;

import com.fnproject.fn.api.httpgateway.HTTPGatewayContext;

public class HelloFunction {
    private static final String HEALTH_CHECK_URL = "/cold/health";

    public static class HealthCheckResult {
        public HealthStatus status;
        public HealthCheckResult() {
            // default constructor.
        }

        public HealthCheckResult(HealthStatus status) {
            this.status = status;
        }
    }

    public enum HealthStatus {
        UP, DOWN
    }

    public Object handleRequest(HTTPGatewayContext httpGatewayContext) {
        return HEALTH_CHECK_URL.equals(httpGatewayContext.getRequestURL())
                ? healthCheck()
                : hello();
    }

    private String hello() {
        return "Hello, world!!";
    }

    private HealthCheckResult healthCheck() {
        // always return "UP"
        return new HealthCheckResult(HealthStatus.UP);
    }

}