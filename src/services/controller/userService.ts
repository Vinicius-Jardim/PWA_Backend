import { roles } from "../../models/userModel";
import  User from "../../models/userModel";

export class UserService {
  static async me(user: any) {
    try {
        const userData = await User.findById(user);
        if (!userData) {
          return { message: "User not found" };
        }
        if (userData.role === roles.ATHLETE) {
            const data = {
                name: userData.name,
                email: userData.email,
                instructorId: userData.instructorId,
                belt: userData.belt,
                age: userData.age,
                joinedDate: userData.joinedDate,
                monthlyFee: userData.monthlyFee,
                gender: userData.gender,
            }
            return data;
        }
        if (userData.role === roles.INSTRUCTOR) {
            const data = {
                name: userData.name,
                email: userData.email,
                athletes: userData.athletes,
                examSchedule: userData.examSchedule,
            }
            return data;
        }
        if (userData.role === roles.ADMIN) {
            const data = {
                name: userData.name,
                email: userData.email,
                role : userData.role,
            }
            return data;
        }
        return userData;
    } catch (error) {
      console.error("Error fetching user data:", error, { stack: error });
      return { message: "An unexpected error occurred" };
    }
  }
}