package com.healthbridge.repository;

import com.healthbridge.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByHospitalId(Long hospitalId);
    List<Doctor> findBySpecializationIgnoreCase(String specialization);
    List<Doctor> findByHospitalIdAndSpecializationIgnoreCase(Long hospitalId, String specialization);
    Optional<Doctor> findByUserId(Long userId);

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:query IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.hospital.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:hospitalId IS NULL OR d.hospital.id = :hospitalId) AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) = LOWER(:specialization))")
    List<Doctor> searchDoctors(@Param("query") String query,
                               @Param("hospitalId") Long hospitalId,
                               @Param("specialization") String specialization);
}
