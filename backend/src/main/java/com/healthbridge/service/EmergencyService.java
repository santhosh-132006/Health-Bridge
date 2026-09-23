package com.healthbridge.service;

import com.healthbridge.dto.EmergencyRequestDto;
import com.healthbridge.entity.EmergencyRequest;
import com.healthbridge.entity.Hospital;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.EmergencyRequestRepository;
import com.healthbridge.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class EmergencyService {

    private final EmergencyRequestRepository emergencyRepository;
    private final HospitalRepository hospitalRepository;

    public EmergencyService(EmergencyRequestRepository emergencyRepository,
                            HospitalRepository hospitalRepository) {
        this.emergencyRepository = emergencyRepository;
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional
    public EmergencyRequest createEmergencyRequest(EmergencyRequestDto dto) {
        Hospital hospital = null;
        if (dto.getHospitalId() != null) {
            hospital = hospitalRepository.findById(dto.getHospitalId()).orElse(null);
        }
        if (hospital == null) {
            // Pick first emergency hospital as default
            List<Hospital> emgHospitals = hospitalRepository.findByEmergencyAvailableTrue();
            if (!emgHospitals.isEmpty()) {
                hospital = emgHospitals.get(0);
            }
        }

        String emergencyCode = "EMG-" + (10000 + new Random().nextInt(90000));

        EmergencyRequest emg = new EmergencyRequest();
        emg.setEmergencyCode(emergencyCode);
        emg.setPatientName(dto.getPatientName());
        emg.setPatientPhone(dto.getPatientPhone());
        emg.setEmergencyType(dto.getEmergencyType());
        emg.setDescription(dto.getDescription());
        emg.setLatitude(dto.getLatitude());
        emg.setLongitude(dto.getLongitude());
        emg.setLocationAddress(dto.getLocationAddress());
        emg.setHospital(hospital);
        emg.setStatus("REQUEST_RECEIVED");

        return emergencyRepository.save(emg);
    }

    public EmergencyRequest getEmergencyById(Long id) {
        return emergencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found with id: " + id));
    }

    public EmergencyRequest getEmergencyByCode(String code) {
        return emergencyRepository.findByEmergencyCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found with code: " + code));
    }

    public List<EmergencyRequest> getAllEmergencies() {
        return emergencyRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public EmergencyRequest updateStatus(Long id, String status) {
        EmergencyRequest emg = emergencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found with id: " + id));
        emg.setStatus(status.toUpperCase());
        return emergencyRepository.save(emg);
    }
}
