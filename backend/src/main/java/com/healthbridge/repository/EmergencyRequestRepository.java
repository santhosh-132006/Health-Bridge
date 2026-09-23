package com.healthbridge.repository;

import com.healthbridge.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    Optional<EmergencyRequest> findByEmergencyCode(String emergencyCode);
    List<EmergencyRequest> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    List<EmergencyRequest> findAllByOrderByCreatedAtDesc();
}
