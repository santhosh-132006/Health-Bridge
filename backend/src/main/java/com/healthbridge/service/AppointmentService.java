package com.healthbridge.service;

import com.healthbridge.dto.AppointmentBookingRequest;
import com.healthbridge.dto.AppointmentResponse;
import com.healthbridge.entity.*;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              HospitalRepository hospitalRepository,
                              DoctorAvailabilityRepository availabilityRepository,
                              UserRepository userRepository,
                              NotificationRepository notificationRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentBookingRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        Hospital hospital = null;
        if (request.getHospitalId() != null) {
            hospital = hospitalRepository.findById(request.getHospitalId()).orElse(doctor.getHospital());
        } else {
            hospital = doctor.getHospital();
        }

        LocalDate appointmentDate = LocalDate.parse(request.getAppointmentDate());

        DoctorAvailability slot = null;
        if (request.getSlotId() != null) {
            slot = availabilityRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

            if ("BOOKED".equalsIgnoreCase(slot.getSlotStatus())) {
                throw new IllegalArgumentException("Selected slot is already booked. Please choose another time slot.");
            }
            // Lock the slot
            slot.setSlotStatus("BOOKED");
            availabilityRepository.save(slot);
        }

        User patientUser = null;
        if (request.getPatientId() != null) {
            patientUser = userRepository.findById(request.getPatientId()).orElse(null);
        }

        String appointmentCode = "APT-" + (10000 + new Random().nextInt(90000));

        Appointment appointment = new Appointment();
        appointment.setAppointmentCode(appointmentCode);
        appointment.setPatient(patientUser);
        appointment.setDoctor(doctor);
        appointment.setHospital(hospital);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setPatientName(request.getPatientName());
        appointment.setPatientAge(request.getPatientAge());
        appointment.setPatientPhone(request.getPatientPhone());
        appointment.setReason(request.getReason());
        appointment.setStatus("CONFIRMED");

        Appointment saved = appointmentRepository.save(appointment);

        // Generate notification
        if (patientUser != null) {
            Notification notice = new Notification(
                    patientUser,
                    "Appointment Confirmed: " + appointmentCode,
                    "Your appointment with " + doctor.getName() + " (" + doctor.getSpecialization() +
                    ") at " + hospital.getName() + " is confirmed for " + appointmentDate + " at " + request.getAppointmentTime() + ".",
                    "APPOINTMENT"
            );
            notificationRepository.save(notice);
        }

        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(doctorId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorTodayAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndAppointmentDateOrderByAppointmentTimeAsc(doctorId, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToResponse(apt);
    }

    public AppointmentResponse getAppointmentByCode(String code) {
        Appointment apt = appointmentRepository.findByAppointmentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with code: " + code));
        return mapToResponse(apt);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, String status) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        String oldStatus = apt.getStatus();
        apt.setStatus(status.toUpperCase());

        // If cancelled, release the slot if present
        if ("CANCELLED".equalsIgnoreCase(status) && apt.getSlot() != null) {
            apt.getSlot().setSlotStatus("AVAILABLE");
            availabilityRepository.save(apt.getSlot());
        }

        Appointment updated = appointmentRepository.save(apt);

        // Notify patient if associated
        if (apt.getPatient() != null && !oldStatus.equalsIgnoreCase(status)) {
            Notification notice = new Notification(
                    apt.getPatient(),
                    "Appointment " + status.toUpperCase(),
                    "Your appointment " + apt.getAppointmentCode() + " with " + apt.getDoctor().getName() +
                    " status has been updated to: " + status.toUpperCase() + ".",
                    "APPOINTMENT"
            );
            notificationRepository.save(notice);
        }

        return mapToResponse(updated);
    }

    public AppointmentResponse mapToResponse(Appointment apt) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(apt.getId());
        res.setAppointmentCode(apt.getAppointmentCode());
        if (apt.getPatient() != null) {
            res.setPatientId(apt.getPatient().getId());
        }
        res.setPatientName(apt.getPatientName());
        res.setPatientAge(apt.getPatientAge());
        res.setPatientPhone(apt.getPatientPhone());
        res.setDoctorId(apt.getDoctor().getId());
        res.setDoctorName(apt.getDoctor().getName());
        res.setSpecialization(apt.getDoctor().getSpecialization());
        res.setHospitalId(apt.getHospital().getId());
        res.setHospitalName(apt.getHospital().getName());
        res.setHospitalAddress(apt.getHospital().getAddress() + ", " + apt.getHospital().getCity());
        res.setAppointmentDate(apt.getAppointmentDate());
        res.setAppointmentTime(apt.getAppointmentTime());
        res.setReason(apt.getReason());
        res.setStatus(apt.getStatus());
        res.setConsultationFee(apt.getDoctor().getConsultationFee());
        res.setCreatedAt(apt.getCreatedAt());
        return res;
    }
}
