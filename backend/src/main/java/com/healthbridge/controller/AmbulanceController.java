package com.healthbridge.controller;

import com.healthbridge.dto.AmbulanceRequestDto;
import com.healthbridge.dto.StatusUpdateDto;
import com.healthbridge.entity.AmbulanceRequest;
import com.healthbridge.service.AmbulanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulance")
@CrossOrigin(origins = "*")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    public AmbulanceController(AmbulanceService ambulanceService) {
        this.ambulanceService = ambulanceService;
    }

    @PostMapping
    public ResponseEntity<AmbulanceRequest> requestAmbulance(@Valid @RequestBody AmbulanceRequestDto dto) {
        AmbulanceRequest created = ambulanceService.requestAmbulance(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AmbulanceRequest>> getAllAmbulanceRequests() {
        return ResponseEntity.ok(ambulanceService.getAllAmbulanceRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmbulanceRequest> getAmbulanceById(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<AmbulanceRequest> getAmbulanceByCode(@PathVariable String code) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceByCode(code));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AmbulanceRequest> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDto dto) {
        return ResponseEntity.ok(ambulanceService.updateStatus(id, dto.getStatus()));
    }
}
