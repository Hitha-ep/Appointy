import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { generateTimeSlots, getDayName } from '../utils/availabilityUtils.js';

export const getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      specialization,
      minFee,
      maxFee,
      available,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialization && specialization !== 'all') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query)
      .populate('user', 'name email profileImage')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};


export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'user',
      'name email profileImage'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      'user',
      'name email profileImage phone'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};


export const getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.isAvailable) {
      return res.json({ success: true, data: [], message: 'Doctor is not available' });
    }

    // Check if the requested day is in doctor's available days
    const dayName = getDayName(date);
    if (!doctor.availableDays.includes(dayName)) {
      return res.json({
        success: true,
        data: [],
        message: `Doctor is not available on ${dayName}`,
      });
    }

   
    const { startTime, endTime, duration } = doctor.availableTimeSlots;
    const allSlots = generateTimeSlots(startTime, endTime, duration);

   
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    });

    const bookedSlots = bookedAppointments.map((a) => a.appointmentTime);

   
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, data: availableSlots, dayName });
  } catch (error) {
    next(error);
  }
};


export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
      availableDays,
      availableTimeSlots,
      profileImage,
    } = req.body;

    if (!name || !email || !password || !specialization || !consultationFee) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, specialization and consultationFee',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'doctor',
    });

    
    const doctor = await Doctor.create({
      user: user._id,
      name,
      email,
      phone: phone || '',
      specialization,
      qualification: qualification || '',
      experience: experience || 0,
      consultationFee,
      profileImage: profileImage || '',
      about: about || '',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: availableTimeSlots || {
        startTime: '09:00',
        endTime: '17:00',
        duration: 30,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};


export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (
      req.user.role !== 'admin' &&
      doctor.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor',
      });
    }

    const allowedFields = [
      'name', 'phone', 'specialization', 'qualification',
      'experience', 'consultationFee', 'about', 'profileImage',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    const updatedDoctor = await doctor.save();

    // Update user name if changed
    if (req.body.name) {
      await User.findByIdAndUpdate(doctor.user, { name: req.body.name });
    }

    res.json({ success: true, message: 'Doctor updated successfully', data: updatedDoctor });
  } catch (error) {
    next(error);
  }
};


export const updateDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (
      req.user.role !== 'admin' &&
      doctor.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { availableDays, availableTimeSlots, isAvailable } = req.body;

    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (availableTimeSlots !== undefined) doctor.availableTimeSlots = availableTimeSlots;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    const updatedDoctor = await doctor.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};


export const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json({ success: true, data: specializations });
  } catch (error) {
    next(error);
  }
};
