package com.example.fn;

import com.fnproject.fn.api.httpgateway.HTTPGatewayContext;

import java.util.logging.Logger;

public class HelloFunction {
    private static final String HEALTH_CHECK_URL = "/cold/health";
    private static final Logger LOGGER = Logger.getLogger(HelloFunction.class.getName());

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