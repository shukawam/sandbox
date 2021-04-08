package com.example.fn;

import com.fnproject.fn.api.httpgateway.HTTPGatewayContext;

import java.util.logging.Logger;

public class HelloFunction {

    private static final Logger LOGGER = Logger.getLogger(HelloFunction.class.getName());

    public Object handleRequest(HTTPGatewayContext httpGatewayContext) {
        LOGGER.info(String.format("RequestURL: %s", httpGatewayContext.getRequestURL()));
        return "ok";
    }

    private String hello() {
        return "Hello, world!!";
    }

    private HealthCheckResult healthCheck() {
        // always return "UP"
        return new HealthCheckResult(HealthStatus.UP);
    }

}