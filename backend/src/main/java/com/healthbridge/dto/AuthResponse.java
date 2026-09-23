package com.healthbridge.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Long doctorId; // populated if role is DOCTOR

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String name, String email, String phone, String role, Long doctorId) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.doctorId = doctorId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}
