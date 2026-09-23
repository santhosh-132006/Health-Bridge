package com.healthbridge.repository;

import com.healthbridge.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByCityIgnoreCase(String city);
    List<Hospital> findByEmergencyAvailableTrue();

    @Query("SELECT h FROM Hospital h WHERE " +
           "(:query IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:emergencyOnly IS NULL OR :emergencyOnly = false OR h.emergencyAvailable = true)")
    List<Hospital> searchHospitals(@Param("query") String query,
                                  @Param("city") String city,
                                  @Param("emergencyOnly") Boolean emergencyOnly);
}
