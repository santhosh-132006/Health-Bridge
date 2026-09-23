package com.healthbridge.service;

import com.healthbridge.dto.DashboardStatsDto;
import com.healthbridge.repository.AppointmentRepository;
import com.healthbridge.repository.EmergencyRequestRepository;
import com.healthbridge.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(AppointmentRepository appointmentRepository,
                            EmergencyRequestRepository emergencyRepository,
                            NotificationRepository notificationRepository) {
        this.appointmentRepository = appointmentRepository;
        this.emergencyRepository = emergencyRepository;
        this.notificationRepository = notificationRepository;
    }

    public DashboardStatsDto getPatientStats(Long patientId) {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setUpcomingAppointments(appointmentRepository.countByPatientIdAndStatus(patientId, "CONFIRMED"));
        stats.setCompletedAppointments(appointmentRepository.countByPatientIdAndStatus(patientId, "COMPLETED"));
        stats.setCancelledAppointments(appointmentRepository.countByPatientIdAndStatus(patientId, "CANCELLED"));
        stats.setTotalEmergencies(emergencyRepository.count());
        stats.setUnreadNotifications(notificationRepository.countByUserIdAndIsReadFalse(patientId));
        return stats;
    }

    public DashboardStatsDto getDoctorStats(Long doctorId) {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTodayAppointments(appointmentRepository.countByDoctorIdAndAppointmentDate(doctorId, LocalDate.now()));
        stats.setUpcomingAppointments(appointmentRepository.countByDoctorIdAndStatus(doctorId, "CONFIRMED"));
        stats.setCompletedAppointments(appointmentRepository.countByDoctorIdAndStatus(doctorId, "COMPLETED"));
        stats.setCancelledAppointments(appointmentRepository.countByDoctorIdAndStatus(doctorId, "CANCELLED"));
        return stats;
    }
}
