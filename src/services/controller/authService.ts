import User from '../../models/userModel';
import { comparePassword, createPassword } from '../../utils/passwordUtil';
import { roles } from '../../models/userModel';
import { createToken } from '../../utils/tokenUtil';

export class AuthService {
    static async register(
        name: string,
        email: string,
        password: string,
        instructorId: string,
        confirmPassword: string
    ) {
        try {
            if (!name ||!email ||!password) {
                return { message: 'Name, email, and password are required' };
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return { message: 'User already exists' };
            }
            if (password !== confirmPassword) {
                return { message: 'Passwords do not match' };
            }
            const hashPassword = await createPassword(password);

            const newUser = new User({
                name,
                email,
                password: hashPassword,
                instructorId: instructorId || null,
                role: instructorId ? roles.INSTRUCTOR : roles.ATHLETE,
            });

            await newUser.save();
            const token = createToken(newUser);
            return token;
        } catch (error) {
            console.error('Error during registration:', error, { stack: error });
            return { message: 'An unexpected error occurred' };
        }
    }

    static async login(email: string, password: string) {
        try {
            if (!email || !password) {
                return { message: 'Email and password are required' };
            }

            const user = await User.findOne({ email });
            if (!user) {
                return { message: 'User not found' };
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return { message: 'Invalid credentials' };
            }
            const token = createToken(user);
            return token;
        } catch (error) {
            console.error('Error during login:', error, { stack: error });
            return { message: 'An unexpected error occurred' };
        }
    }
    
}