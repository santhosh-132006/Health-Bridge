package com.healthbridge.controller;

import com.healthbridge.dto.DashboardStatsDto;
import com.healthbridge.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DashboardStatsDto> getPatientStats(@PathVariable Long patientId) {
        return ResponseEntity.ok(dashboardService.getPatientStats(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<DashboardStatsDto> getDoctorStats(@PathVariable Long doctorId) {
        return ResponseEntity.ok(dashboardService.getDoctorStats(doctorId));
    }
}
