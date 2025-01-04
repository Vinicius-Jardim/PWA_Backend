import User, { IUser } from "../../models/userModel";
import { comparePassword, createPassword } from "../../utils/passwordUtil";
import { roles, RoleType } from "../../models/userModel";
import { createToken } from "../../utils/tokenUtil";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { Schema } from "mongoose";
import { config } from "../../config";

// Function to set authentication cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export class AuthService {
  // Register for athletes
  static async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    birthDate?: string;
    gender?: string;
    instructorId?: string;
    phone?: string;
  }) {
    try {
      const { name, email, password, confirmPassword, birthDate, gender, instructorId, phone } = data;

      // Check required fields
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // If instructorId provided, validate and get instructor
      let instructor;
      if (instructorId) {
        instructor = await User.findById(instructorId);
        if (!instructor || instructor.role !== roles.INSTRUCTOR) {
          throw new Error("Instructor not found");
        }

        // Check if instructor has reached max students (10)
        const athleteCount = await User.countDocuments({ instructorId: instructor._id });
        if (athleteCount >= 10) {
          throw new Error("This instructor has reached the maximum number of students");
        }
      }

      // Create password hash
      const hashPassword = await createPassword(password);

      // Create user as ATHLETE
      const newUser = new User({
        name,
        email,
        password: hashPassword,
        role: roles.ATHLETE,
        instructorId: instructor?._id,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        phone,
        belt: "WHITE"
      });

      await newUser.save();

      // Create JWT token
      const token = createToken(newUser);
      return { 
        token, 
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role,
          instructorId: newUser.instructorId 
        } 
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(email: string, password: string, res: Response) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      const token = createToken(user);
      setAuthCookie(res, token.token);

      return token;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  static async loginWithQR(qrCode: string, res: Response) {
    try {
      if (!qrCode) {
        throw new Error("QR code is required");
      }

      // Decode QR code
      let qrData;
      try {
        qrData = JSON.parse(qrCode);
      } catch (error) {
        throw new Error("Invalid QR code format");
      }

      if (!qrData.token) {
        throw new Error("QR code missing token");
      }

      // Extract ID from token
      const decodedToken = jwt.verify(
        qrData.token,
        process.env.SECRET_KEY || "supersecretkey"
      ) as any;
      const userId = decodedToken.id;

      if (!userId) {
        throw new Error("Token missing user ID");
      }

      // Find user by token ID
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Update user's QR code
      user.qrCode = qrCode;
      await user.save();

      // Create JWT token
      const token = createToken(user);

      // Set authentication cookie
      setAuthCookie(res, token.token);

      return {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token: token.token,
      };
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(userId: Schema.Types.ObjectId, oldPassword: string, newPassword: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      const hashedPassword = await createPassword(newPassword);
      user.password = hashedPassword;
      await user.save();
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(email: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        config.secretKey,
        { expiresIn: config.resetTokenExpires }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // Enviar email com o token de reset
      await sendResetPasswordEmail(email, resetToken);
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error("Invalid or expired password reset token");
      }

      const hashedPassword = await createPassword(newPassword);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    } catch (error) {
      throw error;
    }
  }
}
