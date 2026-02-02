const { User } = require("../../../models/authModels");
const { generateToken } = require("../../../utils/generateToken");
const { generateCeebrainId } = require("../../../utils");

const signup = async (req, res) => {
  try {
    const {
      // Authentication
      email,
      password,
      mobileNumber,
      authProvider, // 'MOBILE_OTP', 'EMAIL_PASSWORD', 'BOTH'

      // Core Identity
      fullName,
      dateOfBirth,
      gender,
      identityType,

      // Address
      address,

      // Socio-Economic
      belowPovertyLine,
      underprivilegedCategory,

      // Consent
      selfRegulatoryFrameworkAccepted
    } = req.body;

    // Validate required fields
    const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'address', 'selfRegulatoryFrameworkAccepted'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          status: false,
          message: `${field} is required`
        });
      }
    }

    // Validate consent acceptance
    if (!selfRegulatoryFrameworkAccepted) {
      return res.status(400).json({
        status: false,
        message: "You must accept the self-regulatory framework to register"
      });
    }

    // Validate address fields
    const requiredAddressFields = ['addressLine1', 'city', 'district', 'state', 'postalCode'];
    for (const field of requiredAddressFields) {
      if (!address[field]) {
        return res.status(400).json({
          status: false,
          message: `address.${field} is required`
        });
      }
    }

    // Determine auth provider and validate accordingly
    let determinedAuthProvider = authProvider;

    if (!determinedAuthProvider) {
      if (email && mobileNumber) {
        determinedAuthProvider = 'BOTH';
      } else if (email) {
        determinedAuthProvider = 'EMAIL_PASSWORD';
      } else if (mobileNumber) {
        determinedAuthProvider = 'MOBILE_OTP';
      } else {
        return res.status(400).json({
          status: false,
          message: "At least one authentication method (email or mobile number) is required"
        });
      }
    }

    // Validate based on auth provider
    if (determinedAuthProvider === 'EMAIL_PASSWORD' || determinedAuthProvider === 'BOTH') {
      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Email is required for email authentication"
        });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 8 characters"
        });
      }
    }

    if (determinedAuthProvider === 'MOBILE_OTP' || determinedAuthProvider === 'BOTH') {
      if (!mobileNumber) {
        return res.status(400).json({
          status: false,
          message: "Mobile number is required for mobile authentication"
        });
      }
    }

    // Check if user already exists
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({
          status: false,
          message: "Email already registered"
        });
      }
    }

    if (mobileNumber) {
      const existingMobile = await User.findOne({ mobileNumber });
      if (existingMobile) {
        return res.status(409).json({
          status: false,
          message: "Mobile number already registered"
        });
      }
    }

    // Generate unique CeebrainId
    const ceebrainId = await generateCeebrainId(User);

    // Create user
    const userData = new User({
      // Auth
      email: email?.toLowerCase(),
      password: determinedAuthProvider !== 'MOBILE_OTP' ? password : undefined,
      mobileNumber,
      authProvider: determinedAuthProvider,

      // Identity
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      identityType,
      ceebrainId,

      // Address
      address: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        landmark: address.landmark,
        city: address.city,
        district: address.district,
        state: address.state,
        country: address.country || 'India',
        postalCode: address.postalCode,
        latitude: address.latitude,
        longitude: address.longitude
      },

      // Socio-Economic
      belowPovertyLine: belowPovertyLine || false,
      underprivilegedCategory: underprivilegedCategory || false,

      // Consent
      selfRegulatoryFrameworkAccepted: true,
      consentAcceptedAt: new Date()
    });

    await userData.save();

    // Generate token
    const token = generateToken({
      id: userData._id,
      ceebrainId: userData.ceebrainId,
      authProvider: userData.authProvider
    });

    // Remove sensitive data from response
    const userResponse = userData.toObject();
    delete userResponse.password;

    return res.status(201).json({
      status: true,
      message: "Successfully registered",
      result: {
        user: {
          _id: userData._id,
          ceebrainId: userData.ceebrainId,
          fullName: userData.fullName,
          email: userData.email,
          mobileNumber: userData.mobileNumber,
          authProvider: userData.authProvider,
          verificationStatus: userData.verificationStatus,
          status: userData.status
        },
        token
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        status: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      status: false,
      message: "An error occurred during registration"
    });
  }
};

module.exports = signup;
