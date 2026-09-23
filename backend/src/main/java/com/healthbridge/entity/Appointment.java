package com.healthbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_code", unique = true, nullable = false)
    private String appointmentCode;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @OneToOne
    @JoinColumn(name = "slot_id")
    private DoctorAvailability slot;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private String appointmentTime;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_phone")
    private String patientPhone;

    @Column(length = 1000)
    private String reason;

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Appointment() {
        this.createdAt = LocalDateTime.now();
        this.status = "CONFIRMED";
    }

    public Appointment(String appointmentCode, User patient, Doctor doctor, Hospital hospital,
                       DoctorAvailability slot, LocalDate appointmentDate, String appointmentTime,
                       String patientName, Integer patientAge, String patientPhone, String reason, String status) {
        this.appointmentCode = appointmentCode;
        this.patient = patient;
        this.doctor = doctor;
        this.hospital = hospital;
        this.slot = slot;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.patientName = patientName;
        this.patientAge = patientAge;
        this.patientPhone = patientPhone;
        this.reason = reason;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "CONFIRMED";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppointmentCode() { return appointmentCode; }
    public void setAppointmentCode(String appointmentCode) { this.appointmentCode = appointmentCode; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }

    public DoctorAvailability getSlot() { return slot; }
    public void setSlot(DoctorAvailability slot) { this.slot = slot; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
