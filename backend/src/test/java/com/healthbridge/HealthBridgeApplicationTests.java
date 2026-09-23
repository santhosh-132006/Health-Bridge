package com.healthbridge;

import com.healthbridge.dto.AppointmentBookingRequest;
import com.healthbridge.dto.AppointmentResponse;
import com.healthbridge.dto.AuthRequest;
import com.healthbridge.dto.AuthResponse;
import com.healthbridge.entity.Doctor;
import com.healthbridge.entity.DoctorAvailability;
import com.healthbridge.entity.Hospital;
import com.healthbridge.service.AppointmentService;
import com.healthbridge.service.DoctorService;
import com.healthbridge.service.HospitalService;
import com.healthbridge.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class HealthBridgeApplicationTests {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Test
    @DisplayName("Context Loads and Seed Data Initialized")
    void contextLoads() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        assertFalse(hospitals.isEmpty(), "Hospitals should be initialized");
        assertTrue(hospitals.size() >= 5, "At least 5 hospitals should be seeded");

        List<Doctor> doctors = doctorService.getAllDoctors();
        assertFalse(doctors.isEmpty(), "Doctors should be initialized");
        assertTrue(doctors.size() >= 10, "At least 10 doctors should be seeded");
    }

    @Test
    @DisplayName("Test User Authentication with BCrypt")
    void testUserAuth() {
        AuthRequest req = new AuthRequest("patient@healthbridge.com", "patient123");
        AuthResponse res = userService.login(req);
        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("John Doe", res.getName());
        assertEquals("PATIENT", res.getRole());
    }

    @Test
    @DisplayName("Test Appointment Booking and Slot Locking")
    void testAppointmentBookingFlow() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        Doctor doc = doctors.get(0);
        LocalDate targetDate = LocalDate.now().plusDays(3);

        List<DoctorAvailability> slots = doctorService.getDoctorSlots(doc.getId(), targetDate);
        assertFalse(slots.isEmpty(), "Doctor should have available slots for the date");

        DoctorAvailability selectedSlot = slots.stream()
                .filter(s -> "AVAILABLE".equals(s.getSlotStatus()))
                .findFirst()
                .orElseThrow();

        // 1. Book the appointment
        AppointmentBookingRequest bookingReq = new AppointmentBookingRequest();
        bookingReq.setDoctorId(doc.getId());
        bookingReq.setHospitalId(doc.getHospital().getId());
        bookingReq.setSlotId(selectedSlot.getId());
        bookingReq.setAppointmentDate(targetDate.toString());
        bookingReq.setAppointmentTime(selectedSlot.getStartTime());
        bookingReq.setPatientName("Test Patient");
        bookingReq.setPatientAge(29);
        bookingReq.setPatientPhone("+91 99999 88888");
        bookingReq.setReason("Follow-up medical checkup");

        AppointmentResponse confirmation = appointmentService.bookAppointment(bookingReq);
        assertNotNull(confirmation);
        assertNotNull(confirmation.getAppointmentCode());
        assertTrue(confirmation.getAppointmentCode().startsWith("APT-"));
        assertEquals("CONFIRMED", confirmation.getStatus());

        // 2. Verify that the slot is now BOOKED (locked) in database
        List<DoctorAvailability> refreshedSlots = doctorService.getDoctorSlots(doc.getId(), targetDate);
        DoctorAvailability lockedSlot = refreshedSlots.stream()
                .filter(s -> s.getId().equals(selectedSlot.getId()))
                .findFirst()
                .orElseThrow();
        assertEquals("BOOKED", lockedSlot.getSlotStatus(), "Slot must be marked BOOKED after reservation");

        // 3. Verify that re-booking the same locked slot throws an exception
        assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.bookAppointment(bookingReq);
        }, "Re-booking a locked slot must fail");

        // 4. Cancel appointment and verify slot release
        AppointmentResponse cancelled = appointmentService.updateStatus(confirmation.getId(), "CANCELLED");
        assertEquals("CANCELLED", cancelled.getStatus());

        List<DoctorAvailability> releasedSlots = doctorService.getDoctorSlots(doc.getId(), targetDate);
        DoctorAvailability freeSlot = releasedSlots.stream()
                .filter(s -> s.getId().equals(selectedSlot.getId()))
                .findFirst()
                .orElseThrow();
        assertEquals("AVAILABLE", freeSlot.getSlotStatus(), "Cancelled appointment should release slot to AVAILABLE");
    }

    @Test
    @DisplayName("Test Forgot Password with OTP and Password Reset")
    void testForgotPasswordAndResetFlow() {
        String testEmail = "patient@healthbridge.com";

        // 1. Send OTP
        String otp = userService.sendPasswordResetOtp(testEmail);
        assertNotNull(otp);
        assertEquals(6, otp.length(), "OTP must be 6 digits");

        // 2. Verify OTP
        assertTrue(userService.verifyOtp(testEmail, otp), "OTP must be valid");

        // 3. Reset password
        String newPassword = "newPatientPass999";
        userService.resetPassword(testEmail, otp, newPassword);

        // 4. Old password must fail
        assertThrows(IllegalArgumentException.class, () -> {
            userService.login(new AuthRequest(testEmail, "patient123"));
        }, "Old password must no longer work");

        // 5. New password must succeed
        AuthResponse loginRes = userService.login(new AuthRequest(testEmail, newPassword));
        assertNotNull(loginRes);
        assertNotNull(loginRes.getToken());

        // Restore original password for demo convenience
        String restoreOtp = userService.sendPasswordResetOtp(testEmail);
        userService.resetPassword(testEmail, restoreOtp, "patient123");
    }
}
