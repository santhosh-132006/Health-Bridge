package com.healthbridge.dto;

import jakarta.validation.constraints.NotBlank;

public class AmbulanceRequestDto {
    private Long emergencyRequestId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Contact phone is required")
    private String patientPhone;

    private Integer injuredCount = 1;

    private String description;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    private Double latitude;
    private Double longitude;

    private Long destinationHospitalId;

    public AmbulanceRequestDto() {}

    public Long getEmergencyRequestId() { return emergencyRequestId; }
    public void setEmergencyRequestId(Long emergencyRequestId) { this.emergencyRequestId = emergencyRequestId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public Integer getInjuredCount() { return injuredCount; }
    public void setInjuredCount(Integer injuredCount) { this.injuredCount = injuredCount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Long getDestinationHospitalId() { return destinationHospitalId; }
    public void setDestinationHospitalId(Long destinationHospitalId) { this.destinationHospitalId = destinationHospitalId; }
}
