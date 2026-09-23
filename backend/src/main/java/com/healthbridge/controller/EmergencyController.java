package com.healthbridge.controller;

import com.healthbridge.dto.EmergencyRequestDto;
import com.healthbridge.dto.StatusUpdateDto;
import com.healthbridge.entity.EmergencyRequest;
import com.healthbridge.service.EmergencyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "*")
public class EmergencyController {

    private final EmergencyService emergencyService;

    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    @PostMapping
    public ResponseEntity<EmergencyRequest> createEmergency(@Valid @RequestBody EmergencyRequestDto dto) {
        EmergencyRequest created = emergencyService.createEmergencyRequest(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmergencyRequest>> getAllEmergencies() {
        return ResponseEntity.ok(emergencyService.getAllEmergencies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyRequest> getEmergencyById(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyService.getEmergencyById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<EmergencyRequest> getEmergencyByCode(@PathVariable String code) {
        return ResponseEntity.ok(emergencyService.getEmergencyByCode(code));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<EmergencyRequest> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDto dto) {
        return ResponseEntity.ok(emergencyService.updateStatus(id, dto.getStatus()));
    }
}
