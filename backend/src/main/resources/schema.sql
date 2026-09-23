-- ===================================================================
-- HealthBridge – Smart Healthcare & Emergency Response Platform
-- MySQL Database Schema
-- Database: healthbridge_db
-- ===================================================================

CREATE DATABASE IF NOT EXISTS healthbridge_db;
USE healthbridge_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'PATIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    phone VARCHAR(50),
    opening_time VARCHAR(50),
    closing_time VARCHAR(50),
    emergency_available BOOLEAN DEFAULT TRUE,
    ambulance_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    facilities TEXT,
    description TEXT
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50)
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    hospital_id BIGINT NOT NULL,
    department_id BIGINT,
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200),
    experience INT DEFAULT 0,
    consultation_fee DOUBLE DEFAULT 500.0,
    profile_image VARCHAR(255),
    bio TEXT,
    available_days VARCHAR(200),
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. Doctor Availability / Slots Table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    available_date DATE NOT NULL,
    start_time VARCHAR(30) NOT NULL,
    end_time VARCHAR(30) NOT NULL,
    slot_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_slot_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    slot_id BIGINT,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(30) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_age INT,
    patient_phone VARCHAR(30),
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_apt_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_apt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_apt_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT fk_apt_slot FOREIGN KEY (slot_id) REFERENCES doctor_availability(id) ON DELETE SET NULL
);

-- 7. Emergency Requests Table
CREATE TABLE IF NOT EXISTS emergency_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emergency_code VARCHAR(50) NOT NULL UNIQUE,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(30) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    location_address VARCHAR(255),
    hospital_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUEST_RECEIVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emg_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

-- 8. Ambulance Requests Table
CREATE TABLE IF NOT EXISTS ambulance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) NOT NULL UNIQUE,
    emergency_request_id BIGINT,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(30) NOT NULL,
    injured_count INT DEFAULT 1,
    description TEXT,
    ambulance_number VARCHAR(100),
    driver_name VARCHAR(150),
    driver_phone VARCHAR(50),
    pickup_location VARCHAR(255) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    destination_hospital_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUEST_RECEIVED',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_amb_emergency FOREIGN KEY (emergency_request_id) REFERENCES emergency_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_amb_hospital FOREIGN KEY (destination_hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Password Reset Verification Codes Table
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
