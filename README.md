# HealthBridge – Smart Healthcare & Emergency Response Platform

![HealthBridge Logo](frontend/css/style.css)

**HealthBridge** is a modern, responsive, full-stack healthcare web application connecting patients, hospitals, specialists, and emergency response teams. Built with a robust **Java 17 / Spring Boot 3 / Hibernate / JPA** backend, **MySQL** database, and a modular **HTML5 / CSS3 / Vanilla JavaScript** frontend.

---

## 🌟 Key Features

1. **Hospital Directory & Discovery**:
   - Search hospitals by name, city, facilities, and 24x7 emergency status.
   - Hospital details page showing ICU, Pharmacy, Blood Bank, Radiology, Ambulances, and clinical departments.
   - One-click Google Maps directions and telephone dialing.

2. **Dedicated Multi-Page Appointment Booking Flow**:
   - `Hospital Details` (`hospital-details.html`)
   - `Specialist Selection` (`specialists.html`): Filter by 10+ medical disciplines (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, etc.).
   - `Doctor Selection` (`doctors.html`): View matching doctors with qualification, experience, and fee.
   - `Doctor Details` (`doctor-details.html`): Comprehensive practitioner profile and biography.
   - `Select Date` (`appointment-date.html`): 7-day calendar availability selector.
   - `Select Time Slot` (`appointment-slot.html`): Dynamic morning and afternoon slot picker with real-time status indication (Available vs Booked).
   - `Patient Details` (`patient-details.html`): Patient info form with instant slot locking in database.
   - `Appointment Confirmation` (`appointment-confirmation.html`): Formal ticket generation (`APT-XXXXX`) with printable receipt.

3. **Emergency Center**:
   - Dedicated emergency triage interface with high-visibility alerts.
   - 8 critical emergency categories: 🚗 Accident, 🐍 Snake Bite, ❤️ Severe Chest Pain, 🩸 Severe Bleeding, 🔥 Major Burns, 🧠 Unconsciousness, 🫁 Severe Breathing Difficulty, and Other Emergency.
   - Browser GPS Geolocation auto-detection.
   - 5-stage live status timeline tracker:
     `Request Received` ➔ `Hospital Alerted` ➔ `Assistance Assigned` ➔ `Patient En Route` ➔ `Patient Arrived`.

4. **Accident & Ambulance Dispatch System**:
   - Dedicated rapid ambulance response workflow for vehicular collisions and trauma.
   - Generates unique dispatch tracking ID (e.g. `AMB-10025`).
   - Assigns Advance Life Support (ALS) vehicle, driver name, contact number, and ETA (6-8 mins).
   - 6-stage telemetry tracker:
     `Request Received` ➔ `Ambulance Assigned` ➔ `Driver En Route` ➔ `Ambulance Arrived` ➔ `Patient Picked Up` ➔ `Hospital Reached`.

5. **Dashboards**:
   - **Patient Dashboard** (`patient-dashboard.html`): Real-time stats, upcoming appointments, appointment cancellation with instant slot release, and appointment history.
   - **Doctor Dashboard** (`doctor-dashboard.html`): Daily patient queue, status transitions (Accept, Complete, Cancel).

6. **Notification Center** (`notifications.html`):
   - Real-time notifications for appointment confirmations, cancellations, emergency alerts, and health tips.
   - Unread badge counters and mark-as-read controls.

7. **Authentication & Roles**:
   - Role-based access control (`PATIENT`, `DOCTOR`, `ADMIN`).
   - Secure password hashing using **BCrypt**.
   - One-click demo credentials filling for immediate testing and presentation.
   - **Forgot Password with Email OTP**:
     - 4-step interactive recovery wizard (`forgot-password.html`).
     - Generates cryptographically secure 6-digit verification OTP with 15-minute expiration.
     - Sends rich HTML notification to user's Gmail using Spring Mail (`JavaMailSender`).
     - Development console fallback with preview code for zero-setup local testing.
     - Verifies OTP and updates user's password with BCrypt encryption in database.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+), Responsive CSS Grid & Flexbox, SVG Logo |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring MVC, Spring Data JPA, Hibernate, Spring Security (BCrypt) |
| **Database** | MySQL 8.0+ (with seamless zero-setup H2 in-memory dev fallback) |
| **Build Tool** | Apache Maven 3.9+ |

---

## 📂 Project Structure

```
Health Bridge/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/healthbridge/
│       │   │   ├── HealthBridgeApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── DataInitializer.java        # Seeds 5 hospitals, 11 doctors, slots, users
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── HospitalController.java
│       │   │   │   ├── DoctorController.java
│       │   │   │   ├── AppointmentController.java
│       │   │   │   ├── EmergencyController.java
│       │   │   │   ├── AmbulanceController.java
│       │   │   │   ├── NotificationController.java
│       │   │   │   └── DashboardController.java
│       │   │   ├── dto/                            # Request and Response DTOs
│       │   │   ├── entity/                         # 9 JPA Entities with relationships
│       │   │   ├── exception/                      # Global exception handler & custom exceptions
│       │   │   ├── repository/                     # Spring Data JPA Repositories
│       │   │   └── service/                        # Business logic & slot locking
│       │   └── resources/
│       │       ├── application.properties          # Default config (H2 zero-setup dev)
│       │       ├── application-mysql.properties    # MySQL production config
│       │       ├── schema.sql                      # DDL for MySQL
│       │       └── static/                         # Frontend served directly by Spring Boot
│       └── test/                                   # Automated integration test suite
│
├── frontend/                                       # Modular, standalone frontend
│   ├── index.html                                  # Home & animated splash loader
│   ├── hospitals.html                              # Hospital search & filters
│   ├── hospital-details.html                       # Detailed hospital profile & facilities
│   ├── specialists.html                            # Specialist selection (Step 1)
│   ├── doctors.html                                # Doctor catalog (Step 2)
│   ├── doctor-details.html                         # Doctor credentials & biography (Step 3)
│   ├── appointment-date.html                       # Calendar date selection (Step 4)
│   ├── appointment-slot.html                       # Real-time slot selection & locking (Step 5)
│   ├── patient-details.html                        # Patient information form (Step 6)
│   ├── appointment-confirmation.html               # Confirmed ticket receipt (Step 7)
│   ├── emergency.html                              # Emergency Center & category selection
│   ├── emergency-request.html                      # Emergency triage & 5-stage live tracker
│   ├── ambulance.html                              # Accident & ambulance 6-stage telemetry
│   ├── patient-dashboard.html                      # Patient statistics & appointment actions
│   ├── doctor-dashboard.html                       # Doctor patient queue & visit completion
│   ├── notifications.html                          # Notification center & read receipts
│   ├── login.html                                  # Role-based login with demo auto-fill & Forgot Password link
│   ├── forgot-password.html                        # 4-step interactive password recovery wizard
│   ├── register.html                               # Patient registration
│   ├── css/
│   │   ├── style.css                               # Healthcare palette & base UI components
│   │   ├── dashboard.css                           # Metrics, tables, and timelines
│   │   └── responsive.css                          # Mobile, tablet, and desktop breakpoints
│   └── js/
│       ├── main.js                                 # Core auth, loading screen, toast alerts
│       ├── auth.js                                 # Login & registration handlers
│       ├── forgot-password.js                      # OTP request, 6-digit verification & password reset
│       ├── hospitals.js                            # Hospital discovery & details
│       ├── appointments.js                         # 7-page appointment flow logic
│       ├── emergency.js                            # Emergency submission & live tracker
│       ├── ambulance.js                            # Ambulance dispatch & status progression
│       ├── dashboard.js                            # Patient & Doctor dashboard loaders
│       └── notifications.js                        # Notification management
└── README.md
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Java**: JDK 17 or higher (`java -version`)
- **Maven**: Version 3.8+ (`mvn -version`)
- **MySQL Server** (Optional for production MySQL mode; H2 dev profile works out of the box without any setup)

---

### Step 1: Database Setup (MySQL)

1. Open your MySQL client (MySQL Workbench, Command Line, or phpMyAdmin) and run:
   ```sql
   CREATE DATABASE IF NOT EXISTS healthbridge_db;
   ```
2. You can optionally execute the included `backend/src/main/resources/schema.sql` file, or simply allow Hibernate's `ddl-auto=update` to automatically create all tables upon application startup!

---

### Step 2: Configure Database Connection

The application supports both **MySQL** and **Zero-Setup In-Memory Mode**:

#### Option A: Running with MySQL (Recommended for Production)
In `backend/src/main/resources/application.properties`, activate the MySQL profile or customize credentials:
```properties
spring.profiles.active=mysql
```
Or edit `backend/src/main/resources/application-mysql.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthbridge_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

#### Option B: Running with Zero-Setup Mode (Default)
By default, `application.properties` uses an embedded H2 engine in MySQL compatibility mode. You can start the backend immediately without having MySQL installed or running!

---

### Step 3: Run the Spring Boot Backend

Open your terminal in the `backend` folder:
```powershell
cd backend
mvn spring-boot:run
```
*(To run specifically with MySQL profile from the CLI)*:
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

The Spring Boot backend will start on **`http://localhost:8080`**.
On first startup, `DataInitializer.java` automatically seeds:
- 5 Accredited Hospitals (Apollo, Fortis, Max, Manipal, Lifeline).
- 11 Medical Specialists across 10 disciplines.
- Multiple available and booked consultation slots.
- Sample patient, doctor, and admin accounts.
- Seed emergency alerts and notifications.

---

### Step 4: Open & Test the Application

Since the frontend is bundled in `backend/src/main/resources/static/`, you can access the entire application directly at:
👉 **`http://localhost:8080`**

When opening the website for the first time, visitors land directly on the **Login & Register Portal** (`login.html`), while **Emergency Assistance & Ambulance Dispatch** are directly accessible 24/7 without needing to sign in. Upon entering credentials, all remaining platform content is unlocked!

---

## 🧪 Testing Guide

### 1. Test Entry Gateway & Emergency Access
1. Visit `http://localhost:8080/`:
   - Notice that unauthenticated visitors are automatically directed to the **Login & Register Portal** (`login.html`).
2. **Direct Emergency Access (No Sign In Required)**:
   - On `login.html`, locate the top **Critical Medical Emergency** banner.
   - Click **[🚨 Emergency SOS]** to test immediate triage across 8 emergency categories and GPS detection.
   - Click **[🚑 Ambulance]** to test rapid ambulance dispatch and telemetry tracker.
   - Click **[📞 Dial 108]** for instant helpline dialing.
3. **Switch Between Sign In and Register**:
   - Click the **[📝 Create Account]** tab on `login.html` to view the registration form.
   - Click the **[🔑 Sign In]** tab to return to the login form.
4. **Sign In & Unlock Remaining Content**:
   - Use the quick demo buttons to auto-populate credentials:
     - **👤 Patient Account**: `patient@healthbridge.com` / `patient123`
     - **👨‍⚕️ Doctor Account**: `dr.kumar@healthbridge.com` / `doctor123`
     - **🛡️ Admin Account**: `admin@healthbridge.com` / `admin123`
   - Click **Sign In to Enter Platform →**.
   - You will enter the platform and all remaining content will be displayed (Home, accredited hospitals, specialist doctors, appointment booking, patient dashboard, notifications, and profile chip in the navigation bar).

### 2. Test Forgot Password & Gmail Verification Code Workflow
1. Navigate to **Sign In** (`http://localhost:8080/login.html`).
2. Click the **"Forgot Password?"** link above the sign-in button.
3. On `forgot-password.html`:
   - **Step 1 (Request Code)**: Enter `patient@healthbridge.com` (or click the quick-fill button). Click **"Send Verification Code"**.
   - **Step 2 (Verify OTP)**: A 6-digit code is generated and sent via Spring Mail. For zero-setup local runs, the OTP is conveniently printed in the terminal console banner and displayed on-screen for immediate one-click copying. Enter the 6 digits and click **"Verify Code"**.
   - **Step 3 (Reset Password)**: Enter your new password (e.g. `MyNewSecurePassword!`) and confirm it. Click **"Reset Password"**.
   - **Step 4 (Success)**: Review the confirmation checkmark and click **"Proceed to Sign In"**.
4. Log in with your new password at `login.html` to confirm that the BCrypt hash has been updated in the database.

### 3. Test Multi-Page Appointment Booking Flow
1. Open **Hospitals** (`hospitals.html`), search for "Apollo" or filter by City, then click **[View Hospital]**.
2. On `hospital-details.html`, click **[Book Appointment]**.
3. On `specialists.html`, select **Cardiologist**.
4. On `doctors.html`, view matching specialists and click **[Select Date →]**.
5. On `appointment-date.html`, pick an upcoming consultation date.
6. On `appointment-slot.html`, select an **Available** time slot (notice booked slots are disabled!).
7. On `patient-details.html`, verify summary, enter patient symptoms, and click **[Confirm & Lock Appointment]**.
8. On `appointment-confirmation.html`, review your generated **Reference ID** (e.g. `APT-10021`) and print or navigate to the Patient Dashboard.
9. In the database, the selected slot is now marked `BOOKED`, preventing any duplicate reservations.

### 4. Test Patient Dashboard Actions
1. Navigate to **Dashboard** (`patient-dashboard.html`).
2. Verify that your newly scheduled appointment appears under **Upcoming Doctor Appointments**.
3. Click **[Cancel]**: observe the confirmation prompt, the status change to `CANCELLED`, and the slot being released back to `AVAILABLE`.

### 5. Test Doctor Dashboard
1. Log in with `dr.kumar@healthbridge.com` / `doctor123`.
2. Navigate to `doctor-dashboard.html`.
3. View the patient queue and click **[Mark Complete]** or **[Accept]** to update the appointment status in real-time.

### 6. Test Emergency Center
1. Navigate to **Emergency** (`emergency.html`).
2. Click any emergency condition, e.g. **🐍 Snake Bite** or **❤️ Severe Chest Pain**.
3. On `emergency-request.html`, click **[Auto-Detect GPS Location]** to test Geolocation capture.
4. Submit the emergency alert: observe the generated `EMG-XXXXX` and the 5-stage live status tracker.
5. Use the simulation controller to test advancing the case through:
   `Request Received` ➔ `Hospital Alerted` ➔ `Assistance Assigned` ➔ `Patient En Route` ➔ `Patient Arrived`.

### 7. Test Accident & Ambulance Dispatch
1. Click **Ambulance** (`ambulance.html`) or select **🚗 Accident** from Emergency.
2. Enter casualty details, pickup location, and destination hospital.
3. Submit request: observe generated ID `AMB-10025`, assigned driver (`Vikram Rao`), ambulance unit (`HB-AMB-04`), and 6-stage telemetry tracker.

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (Patient/Doctor) |
| `POST` | `/api/auth/login` | Authenticate user with BCrypt verification |
| `POST` | `/api/auth/forgot-password` | Generate & send 6-digit verification code to user's email |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit code validity and 15-minute expiration |
| `POST` | `/api/auth/reset-password` | Update user password with BCrypt hash in database |
| `GET` | `/api/hospitals` | Retrieve all registered hospitals |
| `GET` | `/api/hospitals/{id}` | Retrieve hospital profile and facilities |
| `GET` | `/api/hospitals/search` | Search hospitals by query, city, emergency availability |
| `GET` | `/api/hospitals/emergency` | Retrieve emergency-ready trauma centers |
| `GET` | `/api/doctors` | Retrieve all registered specialists |
| `GET` | `/api/doctors/{id}` | Retrieve doctor profile and credentials |
| `GET` | `/api/doctors/search` | Search doctors by name, hospital, and specialization |
| `GET` | `/api/doctors/{id}/slots` | Get real-time doctor slots for a specific date |
| `POST` | `/api/appointments` | Book appointment & lock database slot |
| `GET` | `/api/appointments/{id}` | Retrieve appointment by ID |
| `GET` | `/api/appointments/code/{code}` | Retrieve appointment by reference code |
| `GET` | `/api/appointments/patient/{id}` | Retrieve patient's appointments list |
| `GET` | `/api/appointments/doctor/{id}` | Retrieve doctor's queue |
| `PUT` | `/api/appointments/{id}/status` | Update status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `DELETE` | `/api/appointments/{id}` | Cancel appointment and release database slot |
| `POST` | `/api/emergency` | Register emergency alert |
| `GET` | `/api/emergency/{id}` | Retrieve emergency status & details |
| `PUT` | `/api/emergency/{id}/status` | Transition emergency stage |
| `POST` | `/api/ambulance` | Dispatch emergency ambulance |
| `GET` | `/api/ambulance/{id}` | Track ambulance mission and driver telemetry |
| `PUT` | `/api/ambulance/{id}/status` | Update ambulance response status |
| `GET` | `/api/notifications` | Get notifications for patient or doctor |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read |
| `GET` | `/api/dashboard/patient/{id}` | Retrieve patient dashboard metrics |
| `GET` | `/api/dashboard/doctor/{id}` | Retrieve doctor dashboard metrics |

---

## 📄 License & Presentation Note
Developed for academic presentation and healthcare software demonstration. All patient data in demo mode is simulated for prototype evaluation.
