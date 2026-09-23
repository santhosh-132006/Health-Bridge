package com.healthbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppointmentBookingRequest {
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long hospitalId;
    private Long slotId;

    @NotBlank(message = "Appointment date is required (YYYY-MM-DD)")
    private String appointmentDate;

    @NotBlank(message = "Appointment time is required")
    private String appointmentTime;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private Integer patientAge;

    @NotBlank(message = "Patient phone is required")
    private String patientPhone;

    private String reason;

    public AppointmentBookingRequest() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

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
}
