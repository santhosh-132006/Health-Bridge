package com.healthbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "start_time", nullable = false)
    private String startTime; // e.g. "09:00 AM"

    @Column(name = "end_time", nullable = false)
    private String endTime; // e.g. "09:30 AM"

    @Column(name = "slot_status", nullable = false)
    private String slotStatus; // AVAILABLE, BOOKED, BLOCKED

    public DoctorAvailability() {}

    public DoctorAvailability(Doctor doctor, LocalDate availableDate, String startTime, String endTime, String slotStatus) {
        this.doctor = doctor;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotStatus = slotStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getSlotStatus() { return slotStatus; }
    public void setSlotStatus(String slotStatus) { this.slotStatus = slotStatus; }
}
