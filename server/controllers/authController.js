import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { generateToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import { sendEmail, generateOTPEmailTemplate } from '../utils/sendEmail.js';


export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role, specialization, consultationFee } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const assignedRole = role === 'doctor' ? 'doctor' : 'patient';

    let user = await User.findOne({ email });

    if (user) {
      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists. Please log in.',
        });
      }

      // Existing unverified user: update details and generate fresh OTP
      user.name = name;
      user.password = password; // Pre-save hook will hash modified password
      user.phone = phone || user.phone || '';
      user.address = address || user.address || '';
      user.role = assignedRole;
    } else {
      user = new User({
        name,
        email,
        password,
        phone: phone || '',
        address: address || '',
        role: assignedRole,
        isEmailVerified: false,
      });
    }

    // Generate 6-digit OTP
    const otpCode = user.createOTP();
    await user.save();

    // Send OTP Email safely
    let emailResult = { success: false };
    try {
      emailResult = await sendEmail({
        to: user.email,
        subject: 'Appointy - Verify your Email Address',
        html: generateOTPEmailTemplate(otpCode, user.name),
      });
    } catch (emailErr) {
      console.error('Error sending OTP email:', emailErr.message);
    }

    if (assignedRole === 'doctor') {
      const existingDoc = await Doctor.findOne({ user: user._id });
      if (!existingDoc) {
        await Doctor.create({
          user: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          specialization: specialization || 'General Physician',
          qualification: 'MBBS',
          experience: 1,
          consultationFee: consultationFee || 500,
          about: `Dr. ${user.name} is a medical healthcare practitioner.`,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: { startTime: '09:00', endTime: '17:00', duration: 30 },
          isAvailable: true,
        });
      }
    }

    res.status(201).json({
      success: true,
      isEmailVerified: false,
      email: user.email,
      emailSent: emailResult?.success ?? false,
      debugOtp: !emailResult?.success ? otpCode : undefined,
      message: emailResult?.success
        ? 'Registration successful! A 6-digit verification OTP code has been sent to your email.'
        : 'Registration successful! Verification code ready.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and OTP code',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email address is already verified. You can log in.',
      });
    }

    // Check attempts limit (max 5)
    if (user.otpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please click "Resend OTP" to receive a new code.',
      });
    }

    // Check expiry
    if (!user.otpExpire || Date.now() > user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification code has expired. Please click "Resend OTP" for a new code.',
      });
    }

    // Hash entered OTP and compare
    const hashedEnteredOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    if (hashedEnteredOtp !== user.otp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.',
      });
    }

    // Mark user as verified
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    await user.save();

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: true,
        doctorId: doctorProfile ? doctorProfile._id : null,
      },
      message: 'Email verified successfully! Welcome to Appointy.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email address is already verified.',
      });
    }

    // Cooldown check: 15 seconds
    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 15 * 1000) {
      const waitSec = Math.ceil((15000 - (Date.now() - new Date(user.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new OTP.`,
      });
    }

    // Generate new OTP
    const otpCode = user.createOTP();
    await user.save({ validateBeforeSave: false });

    // Send Email safely
    let emailResult = { success: false };
    try {
      emailResult = await sendEmail({
        to: user.email,
        subject: 'Appointy - New Verification OTP Code',
        html: generateOTPEmailTemplate(otpCode, user.name),
      });
    } catch (emailErr) {
      console.error('Error sending resend OTP email:', emailErr.message);
    }

    res.json({
      success: true,
      emailSent: emailResult?.success ?? false,
      debugOtp: !emailResult?.success ? otpCode : undefined,
      message: emailResult?.success
        ? 'A new 6-digit verification code has been sent to your email.'
        : 'A new 6-digit verification code has been generated.',
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.role !== 'admin' && user.isEmailVerified === false) {
      return res.status(401).json({
        success: false,
        isEmailVerified: false,
        email: user.email,
        message: 'Your email address is not verified. Please verify your OTP code to log in.',
      });
    }

    const token = generateToken(user._id);

    
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified ?? true,
        doctorId: doctorProfile ? doctorProfile._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
        doctorId: doctorProfile ? doctorProfile._id : null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with that email address',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const resetUrl = `/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken,
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

