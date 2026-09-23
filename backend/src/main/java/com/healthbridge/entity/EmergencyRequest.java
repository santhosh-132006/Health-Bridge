package com.healthbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests")
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emergency_code", unique = true, nullable = false)
    private String emergencyCode;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_phone", nullable = false)
    private String patientPhone;

    @Column(name = "emergency_type", nullable = false)
    private String emergencyType;

    @Column(length = 1000)
    private String description;

    private Double latitude;
    private Double longitude;

    private String locationAddress;

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    @Column(nullable = false)
    private String status; // REQUEST_RECEIVED, HOSPITAL_ALERTED, ASSISTANCE_ASSIGNED, PATIENT_EN_ROUTE, PATIENT_ARRIVED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public EmergencyRequest() {
        this.createdAt = LocalDateTime.now();
        this.status = "REQUEST_RECEIVED";
    }

    public EmergencyRequest(String emergencyCode, String patientName, String patientPhone,
                            String emergencyType, String description, Double latitude,
                            Double longitude, String locationAddress, Hospital hospital, String status) {
        this.emergencyCode = emergencyCode;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.emergencyType = emergencyType;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationAddress = locationAddress;
        this.hospital = hospital;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "REQUEST_RECEIVED";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmergencyCode() { return emergencyCode; }
    public void setEmergencyCode(String emergencyCode) { this.emergencyCode = emergencyCode; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
