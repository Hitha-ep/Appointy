import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';


export const getDashboardStats = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        confirmedAppointments,
        totalRevenue,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};


export const getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query).select('-password').sort({ createdAt: -1 });

   
    const patientsWithCounts = await Promise.all(
      patients.map(async (patient) => {
        const appointmentCount = await Appointment.countDocuments({ patient: patient._id });
        return {
          ...patient.toObject(),
          appointmentCount,
        };
      })
    );

    res.json({ success: true, count: patients.length, data: patientsWithCounts });
  } catch (error) {
    next(error);
  }
};


export const getAdminAllAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};


export const getAnalytics = async (req, res, next) => {
  try {
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentsByMonth = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

   
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    
    const specialtyDistribution = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    
    const statusDistribution = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedAppointments = appointmentsByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      appointments: item.count,
      year: item._id.year,
    }));

    const formattedRevenue = revenueByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue,
      year: item._id.year,
    }));

    res.json({
      success: true,
      data: {
        appointmentsByMonth: formattedAppointments,
        revenueByMonth: formattedRevenue,
        specialtyDistribution,
        statusDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const addDoctor = async (req, res, next) => {
  try {
    const {
      name, email, password, phone, specialization,
      qualification, experience, consultationFee, about,
      availableDays, availableTimeSlots, profileImage,
    } = req.body;

    if (!name || !email || !password || !specialization || !consultationFee) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
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
      name, email, password,
      phone: phone || '',
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      name, email,
      phone: phone || '',
      specialization,
      qualification: qualification || '',
      experience: experience || 0,
      consultationFee,
      profileImage: profileImage || '',
      about: about || '',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: availableTimeSlots || { startTime: '09:00', endTime: '17:00', duration: 30 },
    });

    res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
  } catch (error) {
    next(error);
  }
};


export const updateDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Sync User record if name, email, or phone changed
    if (req.body.name || req.body.email || req.body.phone) {
      const userUpdate = {};
      if (req.body.name) userUpdate.name = req.body.name;
      if (req.body.email) userUpdate.email = req.body.email;
      if (req.body.phone) userUpdate.phone = req.body.phone;
      await User.findByIdAndUpdate(doctor.user, userUpdate);
    }

    res.json({ success: true, message: 'Doctor updated', data: doctor });
  } catch (error) {
    next(error);
  }
};


export const deleteDoctorById = async (req, res, next) => {
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
