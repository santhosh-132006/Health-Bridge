package com.healthbridge.service;

import com.healthbridge.dto.AmbulanceRequestDto;
import com.healthbridge.entity.AmbulanceRequest;
import com.healthbridge.entity.EmergencyRequest;
import com.healthbridge.entity.Hospital;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.AmbulanceRequestRepository;
import com.healthbridge.repository.EmergencyRequestRepository;
import com.healthbridge.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class AmbulanceService {

    private final AmbulanceRequestRepository ambulanceRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final HospitalRepository hospitalRepository;

    private final String[] DRIVERS = {"Vikram Rao", "Amit Sharma", "Rajesh Patel", "Karthik Nair", "Sunil Verma"};
    private final String[] PHONES = {"+91 98765 43210", "+91 98765 43211", "+91 98765 43212", "+91 98765 43213", "+91 98765 43214"};
    private final String[] VEHICLES = {"HB-AMB-01 (ICU)", "HB-AMB-04 (Advance Life Support)", "HB-AMB-07 (Critical Care)", "HB-AMB-12 (Rapid Response)"};

    public AmbulanceService(AmbulanceRequestRepository ambulanceRepository,
                            EmergencyRequestRepository emergencyRepository,
                            HospitalRepository hospitalRepository) {
        this.ambulanceRepository = ambulanceRepository;
        this.emergencyRepository = emergencyRepository;
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional
    public AmbulanceRequest requestAmbulance(AmbulanceRequestDto dto) {
        Hospital hospital = null;
        if (dto.getDestinationHospitalId() != null) {
            hospital = hospitalRepository.findById(dto.getDestinationHospitalId()).orElse(null);
        }
        if (hospital == null) {
            List<Hospital> hospitals = hospitalRepository.findByEmergencyAvailableTrue();
            if (!hospitals.isEmpty()) {
                hospital = hospitals.get(0);
            }
        }

        EmergencyRequest emergency = null;
        if (dto.getEmergencyRequestId() != null) {
            emergency = emergencyRepository.findById(dto.getEmergencyRequestId()).orElse(null);
        }

        Random rand = new Random();
        String requestCode = "AMB-" + (10020 + rand.nextInt(89980));
        String driver = DRIVERS[rand.nextInt(DRIVERS.length)];
        String driverPhone = PHONES[rand.nextInt(PHONES.length)];
        String ambulanceNumber = VEHICLES[rand.nextInt(VEHICLES.length)];

        AmbulanceRequest amb = new AmbulanceRequest();
        amb.setRequestCode(requestCode);
        amb.setEmergencyRequest(emergency);
        amb.setPatientName(dto.getPatientName());
        amb.setPatientPhone(dto.getPatientPhone());
        amb.setInjuredCount(dto.getInjuredCount() != null ? dto.getInjuredCount() : 1);
        amb.setDescription(dto.getDescription());
        amb.setPickupLocation(dto.getPickupLocation());
        amb.setLatitude(dto.getLatitude());
        amb.setLongitude(dto.getLongitude());
        amb.setDestinationHospital(hospital);
        amb.setAmbulanceNumber(ambulanceNumber);
        amb.setDriverName(driver);
        amb.setDriverPhone(driverPhone);
        amb.setStatus("AMBULANCE_ASSIGNED");

        return ambulanceRepository.save(amb);
    }

    public AmbulanceRequest getAmbulanceById(Long id) {
        return ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance request not found with id: " + id));
    }

    public AmbulanceRequest getAmbulanceByCode(String code) {
        return ambulanceRepository.findByRequestCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance request not found with code: " + code));
    }

    public List<AmbulanceRequest> getAllAmbulanceRequests() {
        return ambulanceRepository.findAllByOrderByRequestedAtDesc();
    }

    @Transactional
    public AmbulanceRequest updateStatus(Long id, String status) {
        AmbulanceRequest amb = ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance request not found with id: " + id));
        amb.setStatus(status.toUpperCase());
        return ambulanceRepository.save(amb);
    }
}
