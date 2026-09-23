package com.healthbridge.dto;

public class DashboardStatsDto {
    private long upcomingAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long totalEmergencies;
    private long todayAppointments;
    private long unreadNotifications;

    public DashboardStatsDto() {}

    public long getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(long upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

    public long getTotalEmergencies() { return totalEmergencies; }
    public void setTotalEmergencies(long totalEmergencies) { this.totalEmergencies = totalEmergencies; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
}
