package com.healthbridge.controller;

import com.healthbridge.dto.AppointmentBookingRequest;
import com.healthbridge.dto.AppointmentResponse;
import com.healthbridge.dto.StatusUpdateDto;
import com.healthbridge.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(@Valid @RequestBody AppointmentBookingRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<AppointmentResponse> getAppointmentByCode(@PathVariable String code) {
        return ResponseEntity.ok(appointmentService.getAppointmentByCode(code));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/today")
    public ResponseEntity<List<AppointmentResponse>> getDoctorTodayAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorTodayAppointments(doctorId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDto dto) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, dto.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, "CANCELLED"));
    }
}
