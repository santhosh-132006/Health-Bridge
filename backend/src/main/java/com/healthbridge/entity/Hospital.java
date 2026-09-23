package com.healthbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    private Double latitude;
    private Double longitude;

    private String phone;

    @Column(name = "opening_time")
    private String openingTime;

    @Column(name = "closing_time")
    private String closingTime;

    @Column(name = "emergency_available")
    private Boolean emergencyAvailable;

    @Column(name = "ambulance_available")
    private Boolean ambulanceAvailable;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(length = 1000)
    private String facilities; // Comma separated: ICU, Laboratory, Pharmacy, Radiology, Ambulance, Emergency

    @Column(length = 1000)
    private String description;

    public Hospital() {}

    public Hospital(String name, String address, String city, Double latitude, Double longitude,
                    String phone, String openingTime, String closingTime, Boolean emergencyAvailable,
                    Boolean ambulanceAvailable, String imageUrl, String facilities, String description) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.phone = phone;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.emergencyAvailable = emergencyAvailable;
        this.ambulanceAvailable = ambulanceAvailable;
        this.imageUrl = imageUrl;
        this.facilities = facilities;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOpeningTime() { return openingTime; }
    public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }

    public String getClosingTime() { return closingTime; }
    public void setClosingTime(String closingTime) { this.closingTime = closingTime; }

    public Boolean getEmergencyAvailable() { return emergencyAvailable; }
    public void setEmergencyAvailable(Boolean emergencyAvailable) { this.emergencyAvailable = emergencyAvailable; }

    public Boolean getAmbulanceAvailable() { return ambulanceAvailable; }
    public void setAmbulanceAvailable(Boolean ambulanceAvailable) { this.ambulanceAvailable = ambulanceAvailable; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
