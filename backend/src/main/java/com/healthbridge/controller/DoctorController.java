package com.healthbridge.controller;

import com.healthbridge.entity.Doctor;
import com.healthbridge.entity.DoctorAvailability;
import com.healthbridge.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<Doctor>> getDoctorsByHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(doctorService.getDoctorsByHospital(hospitalId));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(specialization));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(doctorService.searchDoctors(query, hospitalId, specialization));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<DoctorAvailability>> getDoctorSlots(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(doctorService.getDoctorSlots(id, searchDate));
    }

    @GetMapping("/{id}/dates")
    public ResponseEntity<List<LocalDate>> getDoctorAvailableDates(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getAvailableDates(id));
    }
}
