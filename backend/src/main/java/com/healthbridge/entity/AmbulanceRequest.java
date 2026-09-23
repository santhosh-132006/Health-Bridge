package com.healthbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ambulance_requests")
public class AmbulanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_code", unique = true, nullable = false)
    private String requestCode;

    @ManyToOne
    @JoinColumn(name = "emergency_request_id")
    private EmergencyRequest emergencyRequest;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_phone", nullable = false)
    private String patientPhone;

    @Column(name = "injured_count")
    private Integer injuredCount;

    @Column(length = 1000)
    private String description;

    @Column(name = "ambulance_number")
    private String ambulanceNumber;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "driver_phone")
    private String driverPhone;

    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;

    private Double latitude;
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "destination_hospital_id")
    private Hospital destinationHospital;

    @Column(nullable = false)
    private String status; // REQUEST_RECEIVED, AMBULANCE_ASSIGNED, DRIVER_EN_ROUTE, AMBULANCE_ARRIVED, PATIENT_PICKED_UP, HOSPITAL_REACHED

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    public AmbulanceRequest() {
        this.requestedAt = LocalDateTime.now();
        this.status = "REQUEST_RECEIVED";
    }

    public AmbulanceRequest(String requestCode, EmergencyRequest emergencyRequest, String patientName,
                            String patientPhone, Integer injuredCount, String description,
                            String ambulanceNumber, String driverName, String driverPhone,
                            String pickupLocation, Double latitude, Double longitude,
                            Hospital destinationHospital, String status) {
        this.requestCode = requestCode;
        this.emergencyRequest = emergencyRequest;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.injuredCount = injuredCount;
        this.description = description;
        this.ambulanceNumber = ambulanceNumber;
        this.driverName = driverName;
        this.driverPhone = driverPhone;
        this.pickupLocation = pickupLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.destinationHospital = destinationHospital;
        this.status = status;
        this.requestedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.requestedAt == null) {
            this.requestedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "REQUEST_RECEIVED";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestCode() { return requestCode; }
    public void setRequestCode(String requestCode) { this.requestCode = requestCode; }

    public EmergencyRequest getEmergencyRequest() { return emergencyRequest; }
    public void setEmergencyRequest(EmergencyRequest emergencyRequest) { this.emergencyRequest = emergencyRequest; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public Integer getInjuredCount() { return injuredCount; }
    public void setInjuredCount(Integer injuredCount) { this.injuredCount = injuredCount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAmbulanceNumber() { return ambulanceNumber; }
    public void setAmbulanceNumber(String ambulanceNumber) { this.ambulanceNumber = ambulanceNumber; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Hospital getDestinationHospital() { return destinationHospital; }
    public void setDestinationHospital(Hospital destinationHospital) { this.destinationHospital = destinationHospital; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
}
