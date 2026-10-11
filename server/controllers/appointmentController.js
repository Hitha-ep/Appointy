import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { getDayName, isDateInPast } from '../utils/availabilityUtils.js';


export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, paymentMethod } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date and time are required',
      });
    }

    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is currently not available for appointments',
      });
    }

    
    if (isDateInPast(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates',
      });
    }

    
    const dayName = getDayName(appointmentDate);
    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayName}`,
      });
    }

    
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime,
      status: { $nin: ['cancelled'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }
   const patientConflict = await Appointment.findOne({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime,
      status: { $nin: ['cancelled'] },
    });

    if (patientConflict) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time',
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason: reason || '',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
      status: 'pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization consultationFee profileImage email phone')
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialization consultationFee profileImage email phone')
      .sort({ appointmentDate: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email phone address profileImage')
      .sort({ appointmentDate: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(query);

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: appointments.length,
      total,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};


export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone address profileImage')
      .populate('doctor', 'name specialization consultationFee profileImage email phone qualification experience about');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    let isDoctor = false;
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      isDoctor = doctorProfile && appointment.doctor._id.toString() === doctorProfile._id.toString();
    }

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};


export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

   
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    let isDoctor = false;

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      isDoctor = doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString();
    }

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    appointment.status = 'cancelled';
    if (appointment.paymentStatus === 'paid') {
      appointment.paymentStatus = 'refunded'; // Structure for future refund processing
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required',
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

   
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment',
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    if (isDateInPast(newDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to a past date',
      });
    }

   
    const doctor = await Doctor.findById(appointment.doctor);
    const dayName = getDayName(newDate);

    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayName}`,
      });
    }

   
    const startOfDay = new Date(newDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: newTime,
      status: { $nin: ['cancelled'] },
      _id: { $ne: appointment._id },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }

    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.status = 'pending';

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization consultationFee profileImage')
      .populate('patient', 'name email phone');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
