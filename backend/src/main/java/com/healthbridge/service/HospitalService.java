package com.healthbridge.service;

import com.healthbridge.entity.Hospital;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.HospitalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    public List<Hospital> searchHospitals(String query, String city, Boolean emergencyOnly) {
        return hospitalRepository.searchHospitals(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                (city != null && !city.trim().isEmpty()) ? city.trim() : null,
                emergencyOnly
        );
    }

    public List<Hospital> getEmergencyHospitals() {
        return hospitalRepository.findByEmergencyAvailableTrue();
    }
}
