/**
 * @summary Simple health check endpoint.
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /**
 * @summary Returns service status for uptime monitoring.
 */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "trustus-bank"));
    }
}
