package com.healthbridge.controller;

import com.healthbridge.entity.Hospital;
import com.healthbridge.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getHospitalById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Hospital>> searchHospitals(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, defaultValue = "false") Boolean emergencyOnly) {
        return ResponseEntity.ok(hospitalService.searchHospitals(query, city, emergencyOnly));
    }

    @GetMapping("/emergency")
    public ResponseEntity<List<Hospital>> getEmergencyHospitals() {
        return ResponseEntity.ok(hospitalService.getEmergencyHospitals());
    }
}
