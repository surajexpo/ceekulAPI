const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

// Document sub-schema
const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['Aadhaar', 'Passport', 'VoterID', 'DrivingLicense', 'PAN', 'Other'],
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Verifier sub-schema
const verifierSchema = new mongoose.Schema({
  verifierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifierRole: {
    type: String,
    enum: ['Manager', 'Director']
  },
  verifiedAt: {
    type: Date
  }
}, { _id: false });

// Address sub-schema
const addressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  district: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'District name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters'],
    default: 'India'
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[0-9]{6}$/.test(value);
      },
      message: 'Invalid postal code format (must be 6 digits)'
    }
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  }
}, { _id: false });

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    // ==================== AUTHENTICATION OPTIONS ====================
    // Option A: Mobile Number + OTP
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      validate: {
        validator: function (v) {
          return /^[6-9][0-9]{9}$/.test(v);
        },
        message: 'Invalid Indian mobile number'
      }
    },

    // Option B: Email + Password
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      select: false // Don't include password in queries by default
    },

    // Auth provider tracking
    authProvider: {
      type: String,
      enum: ['MOBILE_OTP', 'EMAIL_PASSWORD', 'BOTH'],
      required: true
    },

    // ==================== CORE IDENTITY PROFILE ====================
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'PreferNotToSay'],
      required: true
    },
    identityType: {
      type: String,
      enum: ['Aadhaar', 'Passport', 'VoterID', 'DrivingLicense', 'Other']
    },
    ceebrainId: {
      type: String,
      required: true,
      unique: true
    },
    profileImage: {
      type: String,
      default: ''
    },

    // ==================== FULL ADDRESS ====================
    address: {
      type: addressSchema,
      required: true
    },

    // ==================== SOCIO-ECONOMIC CLASSIFICATION ====================
    belowPovertyLine: {
      type: Boolean,
      default: false
    },
    underprivilegedCategory: {
      type: Boolean,
      default: false
    },

    // ==================== VERIFICATION & COMPLIANCE ====================
    documents: [documentSchema],
    videoIdentityUrl: {
      type: String
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    verifiedBy: verifierSchema,

    // ==================== CONSENT & GOVERNANCE ====================
    selfRegulatoryFrameworkAccepted: {
      type: Boolean,
      required: true,
      default: false
    },
    consentAcceptedAt: {
      type: Date
    },

    // ==================== SYSTEM CONTROLS ====================
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    },
    role: {
      type: String,
      enum: ['user', 'premium_user', 'moderator'],
      default: 'user'
    },
    lastLoginAt: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// ==================== INDEXES ====================
userSchema.index({ mobileNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ ceebrainId: 1 });
userSchema.index({ 'address.postalCode': 1 });
userSchema.index({ 'address.latitude': 1, 'address.longitude': 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ status: 1 });

// ==================== VALIDATION ====================
// Business Rule: At least one authentication channel must be present
userSchema.pre('validate', function (next) {
  if (!this.mobileNumber && !this.email) {
    this.invalidate('mobileNumber', 'At least one authentication method (mobile or email) is required');
  }

  // If email auth, password is required
  if (this.email && this.authProvider !== 'MOBILE_OTP' && !this.password) {
    this.invalidate('password', 'Password is required for email authentication');
  }

  // Set consent timestamp when accepted
  if (this.selfRegulatoryFrameworkAccepted && !this.consentAcceptedAt) {
    this.consentAcceptedAt = new Date();
  }

  next();
});

// ==================== PASSWORD HASHING ====================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// ==================== INSTANCE METHODS ====================
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 }
  });
};

// ==================== STATIC METHODS ====================
userSchema.statics.findByMobile = function (mobileNumber) {
  return this.findOne({ mobileNumber, status: { $ne: 'Suspended' } });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), status: { $ne: 'Suspended' } });
};

userSchema.statics.findByCeebrainId = function (ceebrainId) {
  return this.findOne({ ceebrainId });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
