package com.healthbridge.repository;

import com.healthbridge.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorIdAndAvailableDateOrderByStartTimeAsc(Long doctorId, LocalDate availableDate);

    List<DoctorAvailability> findByDoctorIdAndAvailableDateAndSlotStatusOrderByStartTimeAsc(
            Long doctorId, LocalDate availableDate, String slotStatus);

    @Query("SELECT DISTINCT a.availableDate FROM DoctorAvailability a " +
           "WHERE a.doctor.id = :doctorId AND a.availableDate >= :fromDate AND a.slotStatus = 'AVAILABLE' " +
           "ORDER BY a.availableDate ASC")
    List<LocalDate> findAvailableDatesByDoctor(@Param("doctorId") Long doctorId, @Param("fromDate") LocalDate fromDate);
}
