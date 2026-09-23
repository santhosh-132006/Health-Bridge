package com.healthbridge.config;

import com.healthbridge.entity.*;
import com.healthbridge.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final AmbulanceRequestRepository ambulanceRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           HospitalRepository hospitalRepository,
                           DepartmentRepository departmentRepository,
                           DoctorRepository doctorRepository,
                           DoctorAvailabilityRepository availabilityRepository,
                           AppointmentRepository appointmentRepository,
                           EmergencyRequestRepository emergencyRepository,
                           AmbulanceRequestRepository ambulanceRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
        this.emergencyRepository = emergencyRepository;
        this.ambulanceRepository = ambulanceRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (hospitalRepository.count() > 0) {
            return; // Hospitals already seeded
        }

        System.out.println(">>> Initializing HealthBridge Seed Data...");

        User patientUser = userRepository.findByEmail("patient@healthbridge.com").orElse(null);
        User docUser1 = userRepository.findByEmail("dr.kumar@healthbridge.com").orElse(null);
        User docUser2 = userRepository.findByEmail("dr.sarah@healthbridge.com").orElse(null);
        User docUser3 = userRepository.findByEmail("dr.rajesh@healthbridge.com").orElse(null);

        // 2. Create Hospitals
        Hospital h1 = new Hospital(
                "Apollo Multispeciality Hospital",
                "Plot 15, Sector 44, Mathura Road",
                "New Delhi",
                28.5355, 77.2410,
                "+91 11 2692 5858",
                "08:00 AM", "10:00 PM",
                true, true,
                "hospital-1.jpg",
                "ICU, Laboratory, Pharmacy, Radiology, Ambulance, Emergency Department, Blood Bank",
                "Premier multi-speciality tertiary care hospital with world-class facilities and 24x7 emergency trauma care center."
        );

        Hospital h2 = new Hospital(
                "Fortis Memorial Research Institute",
                "Sector 62, Phase 8",
                "Gurugram",
                28.4595, 77.0266,
                "+91 124 4921021",
                "24 Hours", "24 Hours",
                true, true,
                "hospital-2.jpg",
                "ICU, Laboratory, Pharmacy, Radiology, Ambulance, Emergency Department, Cath Lab",
                "Next-generation hospital known for state-of-the-art super-speciality medical care and advanced cardiac life support."
        );

        Hospital h3 = new Hospital(
                "Max Super Speciality Hospital",
                "1, 2 Press Enclave Marg, Saket",
                "New Delhi",
                28.5284, 77.2185,
                "+91 11 2651 5050",
                "07:30 AM", "11:00 PM",
                true, true,
                "hospital-3.jpg",
                "ICU, Laboratory, Pharmacy, Radiology, Ambulance, Emergency Department",
                "Comprehensive quaternary care center with specialized centers of excellence in cardiology, neurology, and orthopedics."
        );

        Hospital h4 = new Hospital(
                "Manipal Hospital",
                "98 HAL Airport Road, Kodihalli",
                "Bengaluru",
                12.9592, 77.6496,
                "+91 80 2502 4444",
                "08:00 AM", "09:30 PM",
                true, true,
                "hospital-4.jpg",
                "ICU, Laboratory, Pharmacy, Radiology, Ambulance, Emergency Department, Dialysis",
                "Leading healthcare provider offering comprehensive diagnostic and therapeutic facilities with accredited trauma response."
        );

        Hospital h5 = new Hospital(
                "Lifeline City Hospital",
                "12 Park Street, Central District",
                "Kolkata",
                22.5535, 88.3518,
                "+91 33 2229 0101",
                "08:00 AM", "08:00 PM",
                false, true,
                "hospital-5.jpg",
                "Laboratory, Pharmacy, Radiology, Ambulance, Day Care Clinic",
                "Trusted community health hospital dedicated to accessible family medicine, day care surgeries, and routine consultations."
        );

        hospitalRepository.saveAll(List.of(h1, h2, h3, h4, h5));

        // 3. Create Departments
        Department dCardio = departmentRepository.save(new Department("Cardiology", "Specialized care for heart health, coronary conditions and cardiovascular disorders.", "heart"));
        Department dNeuro = departmentRepository.save(new Department("Neurology", "Comprehensive diagnosis and treatment for brain, spine, and nervous system disorders.", "brain"));
        Department dOrtho = departmentRepository.save(new Department("Orthopedics", "Advanced joint replacements, fracture repairs, and musculoskeletal wellness.", "bone"));
        Department dDerma = departmentRepository.save(new Department("Dermatology", "Clinical and aesthetic skincare, hair therapy, and allergy management.", "sparkles"));
        Department dPedia = departmentRepository.save(new Department("Pediatrics", "Gentle, compassionate pediatric and neonatal healthcare for infants and children.", "baby"));
        Department dOphta = departmentRepository.save(new Department("Ophthalmology", "Vision correction, retinal surgery, cataracts and comprehensive eye care.", "eye"));
        Department dEnt = departmentRepository.save(new Department("ENT", "Specialist treatment for ear, nose, throat conditions and sinus surgery.", "ear"));
        Department dPulmo = departmentRepository.save(new Department("Pulmonology", "Respiratory treatments, asthma management, and lung wellness programs.", "lungs"));
        Department dGastro = departmentRepository.save(new Department("Gastroenterology", "Digestive health, liver care, endoscopy and gastrointestinal treatments.", "stomach"));
        Department dGenMed = departmentRepository.save(new Department("General Medicine", "Primary healthcare, chronic disease management, and preventative checkups.", "stethoscope"));

        // 4. Create 10+ Doctors
        Doctor doc1 = new Doctor(docUser1, h1, dCardio, "Dr. Arvind Kumar", "Cardiologist",
                "MBBS, MD (Cardiology), FACC", 15, 800.0, "doc-1.jpg",
                "Senior Interventional Cardiologist with over 15 years of experience in angioplasty, heart failure, and preventive cardiology.",
                "Monday, Wednesday, Friday");

        Doctor doc2 = new Doctor(docUser2, h1, dNeuro, "Dr. Sarah Jenkins", "Neurologist",
                "MBBS, DM (Neurology), MRCP", 12, 950.0, "doc-2.jpg",
                "Leading neurologist specializing in stroke rehabilitation, epilepsy management, migraine management, and nerve disorders.",
                "Tuesday, Thursday, Saturday");

        Doctor doc3 = new Doctor(docUser3, h2, dOrtho, "Dr. Rajesh Mehta", "Orthopedic Specialist",
                "MBBS, MS (Orthopedics), MCh", 18, 900.0, "doc-3.jpg",
                "Renowned orthopedic surgeon specializing in robotic joint replacement, sports injury reconstruction, and arthroscopy.",
                "Monday, Tuesday, Thursday");

        Doctor doc4 = new Doctor(null, h2, dPedia, "Dr. Ananya Sen", "Pediatrician",
                "MBBS, DCH, MD (Pediatrics)", 10, 650.0, "doc-4.jpg",
                "Dedicated pediatrician providing compassionate developmental assessments, vaccinations, and pediatric emergency care.",
                "Monday, Wednesday, Friday");

        Doctor doc5 = new Doctor(null, h3, dDerma, "Dr. Vikramaditya Joshi", "Dermatologist",
                "MBBS, MD (Dermatology, Venereology & Leprosy)", 9, 700.0, "doc-5.jpg",
                "Expert dermatologist specializing in laser skin therapy, clinical dermatology, hair regrowth, and cosmetic procedures.",
                "Tuesday, Thursday, Friday");

        Doctor doc6 = new Doctor(null, h3, dOphta, "Dr. Meenakshi Sundaram", "Ophthalmologist",
                "MBBS, MS (Ophthalmology), FICO", 14, 750.0, "doc-6.jpg",
                "Cataract and refractive laser surgeon with over 5,000 successful surgeries and expert diabetic retinopathy care.",
                "Monday, Wednesday, Saturday");

        Doctor doc7 = new Doctor(null, h4, dEnt, "Dr. Rohan Bansal", "ENT Specialist",
                "MBBS, MS (ENT), DLO", 11, 600.0, "doc-7.jpg",
                "Consultant ENT surgeon skilled in endoscopic sinus surgeries, hearing loss diagnostics, and pediatric ENT ailments.",
                "Tuesday, Thursday, Saturday");

        Doctor doc8 = new Doctor(null, h4, dPulmo, "Dr. Priya Deshmukh", "Pulmonologist",
                "MBBS, MD (Pulmonary Medicine)", 13, 850.0, "doc-8.jpg",
                "Chest specialist focusing on chronic asthma, COPD, sleep apnea studies, and post-viral pulmonary rehabilitation.",
                "Monday, Wednesday, Friday");

        Doctor doc9 = new Doctor(null, h5, dGastro, "Dr. Sanjay Bhattacharya", "Gastroenterologist",
                "MBBS, DM (Gastroenterology)", 16, 900.0, "doc-9.jpg",
                "Expert gastroenterologist and hepatologist offering advanced therapeutic endoscopy and liver disorder management.",
                "Monday, Thursday, Friday");

        Doctor doc10 = new Doctor(null, h5, dGenMed, "Dr. Kavita Verma", "General Physician",
                "MBBS, MD (General Medicine)", 8, 500.0, "doc-10.jpg",
                "Holistic family physician specializing in diabetes, hypertension management, seasonal infections, and wellness guidance.",
                "Monday, Tuesday, Wednesday, Thursday, Friday");

        Doctor doc11 = new Doctor(null, h2, dCardio, "Dr. Robert Chen", "Cardiologist",
                "MD (Internal Medicine), DM (Cardiology)", 14, 850.0, "doc-11.jpg",
                "Specialist in cardiac electrophysiology, pacemaker implants, and non-invasive cardiac evaluation.",
                "Wednesday, Thursday, Saturday");

        List<Doctor> doctors = doctorRepository.saveAll(List.of(doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11));

        // 5. Create Slots for the next 7 days for doctors
        List<DoctorAvailability> allSlots = new ArrayList<>();
        String[] slotTimes = {
                "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
                "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
        };

        LocalDate today = LocalDate.now();
        for (Doctor doc : doctors) {
            for (int d = 0; d < 7; d++) {
                LocalDate date = today.plusDays(d);
                for (int t = 0; t < slotTimes.length; t++) {
                    String time = slotTimes[t];
                    // Mark a couple of slots as BOOKED to demonstrate slot locking realistically
                    String status = (d == 1 && t == 1) || (d == 2 && t == 3) ? "BOOKED" : "AVAILABLE";
                    allSlots.add(new DoctorAvailability(doc, date, time, getEndTime(time), status));
                }
            }
        }
        availabilityRepository.saveAll(allSlots);

        // 6. Create a sample confirmed appointment for the patient
        DoctorAvailability bookedSlot = allSlots.get(0);
        bookedSlot.setSlotStatus("BOOKED");
        availabilityRepository.save(bookedSlot);

        Appointment sampleApt = new Appointment(
                "APT-10021",
                patientUser,
                doc1,
                h1,
                bookedSlot,
                today.plusDays(1),
                "10:00 AM",
                "John Doe",
                32,
                "+91 98765 11223",
                "Routine heart health checkup and blood pressure review",
                "CONFIRMED"
        );
        appointmentRepository.save(sampleApt);

        // 7. Create Sample Notifications
        Notification n1 = new Notification(
                patientUser,
                "Appointment Confirmed: APT-10021",
                "Your appointment with Dr. Arvind Kumar (Cardiologist) at Apollo Multispeciality Hospital is confirmed for " + today.plusDays(1) + " at 10:00 AM.",
                "APPOINTMENT"
        );
        Notification n2 = new Notification(
                patientUser,
                "Health Tip of the Week",
                "Remember to stay hydrated and take a 10-minute walk after lunch to promote cardiovascular circulation.",
                "SYSTEM"
        );
        notificationRepository.saveAll(List.of(n1, n2));

        // 8. Create a sample emergency and ambulance request
        EmergencyRequest emg = new EmergencyRequest(
                "EMG-10015",
                "Rahul Sharma",
                "+91 98111 22334",
                "🚗 Accident",
                "Two-wheeler collision at Ring Road Flyover. Severe knee and arm abrasions.",
                28.5350, 77.2405,
                "Ring Road Flyover, near Mathura Road exit",
                h1,
                "ASSISTANCE_ASSIGNED"
        );
        EmergencyRequest savedEmg = emergencyRepository.save(emg);

        AmbulanceRequest amb = new AmbulanceRequest(
                "AMB-10025",
                savedEmg,
                "Rahul Sharma",
                "+91 98111 22334",
                1,
                "Two-wheeler collision on flyover.",
                "HB-AMB-04 (Advance Life Support)",
                "Vikram Rao",
                "+91 98765 43210",
                "Ring Road Flyover, near Mathura Road exit",
                28.5350, 77.2405,
                h1,
                "DRIVER_EN_ROUTE"
        );
        ambulanceRepository.save(amb);

        System.out.println(">>> HealthBridge Seed Data successfully populated!");
    }

    private String getEndTime(String startTime) {
        if (startTime.contains("09:00 AM")) return "09:30 AM";
        if (startTime.contains("09:30 AM")) return "10:00 AM";
        if (startTime.contains("10:00 AM")) return "10:30 AM";
        if (startTime.contains("10:30 AM")) return "11:00 AM";
        if (startTime.contains("11:00 AM")) return "11:30 AM";
        if (startTime.contains("11:30 AM")) return "12:00 PM";
        if (startTime.contains("02:00 PM")) return "02:30 PM";
        if (startTime.contains("02:30 PM")) return "03:00 PM";
        if (startTime.contains("03:00 PM")) return "03:30 PM";
        if (startTime.contains("03:30 PM")) return "04:00 PM";
        if (startTime.contains("04:00 PM")) return "04:30 PM";
        if (startTime.contains("04:30 PM")) return "05:00 PM";
        return "05:00 PM";
    }

    private void seedUsers() {
        System.out.println(">>> Seeding HealthBridge Users...");
        User patientUser = new User("John Doe", "patient@healthbridge.com",
                passwordEncoder.encode("patient123"), "+91 98765 11223", "PATIENT");
        userRepository.save(patientUser);

        User docUser1 = new User("Dr. Arvind Kumar", "dr.kumar@healthbridge.com",
                passwordEncoder.encode("doctor123"), "+91 98765 22334", "DOCTOR");
        userRepository.save(docUser1);

        User docUser2 = new User("Dr. Sarah Jenkins", "dr.sarah@healthbridge.com",
                passwordEncoder.encode("doctor123"), "+91 98765 33445", "DOCTOR");
        userRepository.save(docUser2);

        User docUser3 = new User("Dr. Rajesh Mehta", "dr.rajesh@healthbridge.com",
                passwordEncoder.encode("doctor123"), "+91 98765 44556", "DOCTOR");
        userRepository.save(docUser3);

        User adminUser = new User("System Administrator", "admin@healthbridge.com",
                passwordEncoder.encode("admin123"), "+91 98765 00000", "ADMIN");
        userRepository.save(adminUser);
    }
}
