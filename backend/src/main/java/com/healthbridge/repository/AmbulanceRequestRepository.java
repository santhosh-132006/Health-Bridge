package com.healthbridge.repository;

import com.healthbridge.entity.AmbulanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRequestRepository extends JpaRepository<AmbulanceRequest, Long> {
    Optional<AmbulanceRequest> findByRequestCode(String requestCode);
    List<AmbulanceRequest> findAllByOrderByRequestedAtDesc();
}
