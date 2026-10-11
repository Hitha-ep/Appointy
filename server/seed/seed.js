import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/appointy');
  console.log('MongoDB connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});
  await Payment.deleteMany({});
  console.log('Existing data cleared');

  // ===== CREATE ADMIN =====
  const adminUser = await User.create({
    name: 'Admin',
    email: 'admin@appointy.com',
    password: 'admin123',
    role: 'admin',
    phone: '9000000000',
  });
  console.log('Admin created: admin@appointy.com / admin123');

  // ===== CREATE DOCTORS =====
  const doctorsData = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'dr.sarah@appointy.com',
      password: 'doctor123',
      phone: '9111111111',
      specialization: 'General Physician',
      qualification: 'MBBS, MD',
      experience: 10,
      consultationFee: 500,
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Sarah Johnson is an experienced general physician with over 10 years of practice. She specializes in preventive care and chronic disease management.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: { startTime: '09:00', endTime: '17:00', duration: 30 },
    },
    {
      name: 'Dr. Michael Chen',
      email: 'dr.michael@appointy.com',
      password: 'doctor123',
      phone: '9222222222',
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: 15,
      consultationFee: 1000,
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Michael Chen is a leading cardiologist with expertise in interventional cardiology, heart failure management, and preventive cardiology.',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: { startTime: '10:00', endTime: '16:00', duration: 30 },
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'dr.priya@appointy.com',
      password: 'doctor123',
      phone: '9333333333',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: 8,
      consultationFee: 700,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Priya Sharma is a renowned dermatologist specializing in cosmetic dermatology, hair disorders, and skin care treatments.',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: { startTime: '09:00', endTime: '15:00', duration: 30 },
    },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh@appointy.com',
      password: 'doctor123',
      phone: '9444444444',
      specialization: 'Pediatrician',
      qualification: 'MBBS, MD (Pediatrics)',
      experience: 12,
      consultationFee: 600,
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Rajesh Kumar is a compassionate pediatrician dedicated to providing comprehensive healthcare for children from birth through adolescence.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availableTimeSlots: { startTime: '08:00', endTime: '14:00', duration: 30 },
    },
    {
      name: 'Dr. Anita Patel',
      email: 'dr.anita@appointy.com',
      password: 'doctor123',
      phone: '9555555555',
      specialization: 'Dentist',
      qualification: 'BDS, MDS',
      experience: 7,
      consultationFee: 400,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Anita Patel is a skilled dentist offering a range of dental services including preventive care, cosmetic dentistry, and oral surgery.',
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      availableTimeSlots: { startTime: '10:00', endTime: '18:00', duration: 30 },
    },
    {
      name: 'Dr. Vikram Singh',
      email: 'dr.vikram@appointy.com',
      password: 'doctor123',
      phone: '9666666666',
      specialization: 'Orthopedic',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: 20,
      consultationFee: 900,
      profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Vikram Singh is a highly experienced orthopedic surgeon specializing in joint replacement, sports medicine, and spine surgery.',
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      availableTimeSlots: { startTime: '09:00', endTime: '17:00', duration: 45 },
    },
    {
      name: 'Dr. Aisha Nair',
      email: 'dr.aisha@appointy.com',
      password: 'doctor123',
      phone: '9711111111',
      specialization: 'Neurologist',
      qualification: 'MBBS, DM (Neurology)',
      experience: 11,
      consultationFee: 1200,
      profileImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Aisha Nair is a consultant neurologist specializing in migraines, stroke prevention, epilepsy management, and neurological disorders.',
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: { startTime: '10:00', endTime: '16:00', duration: 30 },
    },
    {
      name: 'Dr. David Miller',
      email: 'dr.david@appointy.com',
      password: 'doctor123',
      phone: '9722222222',
      specialization: 'Ophthalmologist',
      qualification: 'MBBS, MS (Ophthalmology)',
      experience: 14,
      consultationFee: 650,
      profileImage: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. David Miller is an eye surgeon specializing in vision correction, cataract surgery, and comprehensive ocular wellness.',
      availableDays: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      availableTimeSlots: { startTime: '09:00', endTime: '15:00', duration: 30 },
    },
    {
      name: 'Dr. Sunita Rao',
      email: 'dr.sunita@appointy.com',
      password: 'doctor123',
      phone: '9733333333',
      specialization: 'Gynecologist',
      qualification: 'MBBS, MD, DGO',
      experience: 16,
      consultationFee: 800,
      profileImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Sunita Rao is an obstetrician and gynecologist with over 16 years of expertise in maternal health, high-risk pregnancy, and fertility consultation.',
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      availableTimeSlots: { startTime: '09:30', endTime: '16:30', duration: 30 },
    },
    {
      name: 'Dr. Arjun Kapoor',
      email: 'dr.arjun@appointy.com',
      password: 'doctor123',
      phone: '9744444444',
      specialization: 'ENT Specialist',
      qualification: 'MBBS, MS (ENT)',
      experience: 9,
      consultationFee: 550,
      profileImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Arjun Kapoor is an ear, nose, and throat specialist treating sinus infections, allergic rhinitis, hearing loss, and voice disorders.',
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      availableTimeSlots: { startTime: '11:00', endTime: '18:00', duration: 30 },
    },
    {
      name: 'Dr. Kavita Menon',
      email: 'dr.kavita@appointy.com',
      password: 'doctor123',
      phone: '9755555555',
      specialization: 'Psychiatrist',
      qualification: 'MBBS, MD (Psychiatry)',
      experience: 10,
      consultationFee: 1100,
      profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Kavita Menon is a compassionate mental health specialist providing holistic treatment for anxiety, depression, and lifestyle stress.',
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      availableTimeSlots: { startTime: '10:00', endTime: '17:00', duration: 45 },
    },
    {
      name: 'Dr. Robert Wilson',
      email: 'dr.robert@appointy.com',
      password: 'doctor123',
      phone: '9766666666',
      specialization: 'Pulmonologist',
      qualification: 'MBBS, MD (Pulmonary Medicine)',
      experience: 13,
      consultationFee: 750,
      profileImage: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Robert Wilson specializes in respiratory health, treating asthma, chronic bronchitis, lung infections, and post-viral recovery.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      availableTimeSlots: { startTime: '08:30', endTime: '14:30', duration: 30 },
    },
    {
      name: 'Dr. Meera Nambiar',
      email: 'dr.meera@appointy.com',
      password: 'doctor123',
      phone: '9777777777',
      specialization: 'Endocrinologist',
      qualification: 'MBBS, MD, DM (Endocrinology)',
      experience: 12,
      consultationFee: 850,
      profileImage: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Meera Nambiar is an expert in diabetes management, thyroid health, hormonal imbalance, and metabolic disorders.',
      availableDays: ['Monday', 'Thursday', 'Friday', 'Saturday'],
      availableTimeSlots: { startTime: '09:00', endTime: '15:30', duration: 30 },
    },
    {
      name: 'Dr. Sanjay Verma',
      email: 'dr.sanjay@appointy.com',
      password: 'doctor123',
      phone: '9788888888',
      specialization: 'Gastroenterologist',
      qualification: 'MBBS, MD, DM (Gastroenterology)',
      experience: 18,
      consultationFee: 950,
      profileImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Sanjay Verma is a senior gastroenterologist with 18 years of experience in gastrointestinal, liver, and digestive tract disorders.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      availableTimeSlots: { startTime: '10:00', endTime: '16:00', duration: 30 },
    },
    {
      name: 'Dr. Ritu Saxena',
      email: 'dr.ritu@appointy.com',
      password: 'doctor123',
      phone: '9799999999',
      specialization: 'Oncologist',
      qualification: 'MBBS, MD, DM (Medical Oncology)',
      experience: 14,
      consultationFee: 1500,
      profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Ritu Saxena is a dedicated medical oncologist focusing on modern targeted therapies, compassionate counseling, and comprehensive cancer care.',
      availableDays: ['Tuesday', 'Wednesday', 'Friday'],
      availableTimeSlots: { startTime: '09:00', endTime: '14:00', duration: 45 },
    },
    {
      name: 'Dr. Tariq Al-Mansoor',
      email: 'dr.tariq@appointy.com',
      password: 'doctor123',
      phone: '9800000000',
      specialization: 'Urologist',
      qualification: 'MBBS, MS, MCh (Urology)',
      experience: 15,
      consultationFee: 900,
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Tariq Al-Mansoor is a consultant urological surgeon offering advanced treatments for kidney stones, prostate health, and urinary tract disorders.',
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
      availableTimeSlots: { startTime: '10:00', endTime: '17:00', duration: 30 },
    },
  ];

  const createdDoctors = [];
  for (const docData of doctorsData) {
    const { password, ...profileData } = docData;
    const user = await User.create({
      name: docData.name,
      email: docData.email,
      password: docData.password,
      phone: docData.phone,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      name: docData.name,
      email: docData.email,
      phone: docData.phone,
      specialization: docData.specialization,
      qualification: docData.qualification,
      experience: docData.experience,
      consultationFee: docData.consultationFee,
      profileImage: docData.profileImage || '',
      about: docData.about,
      availableDays: docData.availableDays,
      availableTimeSlots: docData.availableTimeSlots,
      isAvailable: true,
    });

    createdDoctors.push(doctor);
  }
  console.log(`${createdDoctors.length} doctors created`);

  // ===== CREATE PATIENTS =====
  const patient1 = await User.create({
    name: 'John Doe',
    email: 'patient1@test.com',
    password: 'patient123',
    role: 'patient',
    phone: '9777777777',
    address: '123 Main Street, Mumbai',
  });

  const patient2 = await User.create({
    name: 'Jane Smith',
    email: 'patient2@test.com',
    password: 'patient123',
    role: 'patient',
    phone: '9888888888',
    address: '456 Park Avenue, Delhi',
  });
  console.log('2 patients created');

  // ===== CREATE SAMPLE APPOINTMENTS =====
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  await Appointment.create({
    patient: patient1._id,
    doctor: createdDoctors[0]._id,
    appointmentDate: tomorrow,
    appointmentTime: '10:00 AM',
    reason: 'Regular checkup',
    status: 'confirmed',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
  });

  await Appointment.create({
    patient: patient2._id,
    doctor: createdDoctors[1]._id,
    appointmentDate: dayAfter,
    appointmentTime: '11:00 AM',
    reason: 'Heart checkup',
    status: 'pending',
    paymentMethod: 'online',
    paymentStatus: 'paid',
  });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  await Appointment.create({
    patient: patient1._id,
    doctor: createdDoctors[2]._id,
    appointmentDate: pastDate,
    appointmentTime: '09:00 AM',
    reason: 'Skin consultation',
    status: 'completed',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
  });

  console.log('Sample appointments created');
  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:    admin@appointy.com     / admin123');
  console.log('Patient1: patient1@test.com      / patient123');
  console.log('Patient2: patient2@test.com      / patient123');
  console.log('Doctor1:  dr.sarah@appointy.com  / doctor123');
  console.log('Doctor2:  dr.michael@appointy.com / doctor123');
  console.log('(All doctor passwords: doctor123)\n');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
