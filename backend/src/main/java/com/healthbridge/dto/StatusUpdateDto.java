package com.healthbridge.dto;

public class StatusUpdateDto {
    private String status;
    private String notes;

    public StatusUpdateDto() {}

    public StatusUpdateDto(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
