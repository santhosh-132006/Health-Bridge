package com.healthbridge.service;

import com.healthbridge.entity.Doctor;
import com.healthbridge.entity.DoctorAvailability;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.DoctorAvailabilityRepository;
import com.healthbridge.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public DoctorService(DoctorRepository doctorRepository, DoctorAvailabilityRepository availabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public List<Doctor> getDoctorsByHospital(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId);
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationIgnoreCase(specialization);
    }

    public List<Doctor> searchDoctors(String query, Long hospitalId, String specialization) {
        return doctorRepository.searchDoctors(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                hospitalId,
                (specialization != null && !specialization.trim().isEmpty()) ? specialization.trim() : null
        );
    }

    public List<DoctorAvailability> getDoctorSlots(Long doctorId, LocalDate date) {
        return availabilityRepository.findByDoctorIdAndAvailableDateOrderByStartTimeAsc(doctorId, date);
    }

    public List<LocalDate> getAvailableDates(Long doctorId) {
        return availabilityRepository.findAvailableDatesByDoctor(doctorId, LocalDate.now());
    }
}
