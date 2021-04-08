package com.example.fn;

public class HealthCheckResult {
    public HealthStatus status;

    public HealthCheckResult() {
        // default constructor.
    }

    public HealthCheckResult(HealthStatus status) {
        this.status = status;
    }
}
