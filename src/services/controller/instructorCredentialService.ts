import Credential from "../../models/instructorCredential";
import User, { roles } from "../../models/userModel";

export class InstructorCredentialService {
  static async createInstructorCredential(id: string) {
    try {
      if (!id) {
        return { message: "Instructor ID is required" };
      }
      const existingCredential = await Credential.findOne({
        instructorId: id,
      });
      if (existingCredential) {
        return { message: "Instructor credential already exists" };
      }
      const newCredential = new Credential({ instructorId: id });
      await newCredential.save();
      return "Instructor credential created successfully";
    } catch (error) {
      console.error("Error creating instructor credential:", error, {
        stack: error,
      });
      return { message: "An unexpected error occurred" };
    }
  }

  static async getAll(
    filters: { role?: string; search?: string; isUsed: boolean } = {
      isUsed: false,
    },
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      console.log("Initial filters:", filters);

      // Filtro de pesquisa (se houver)
      const searchQuery = filters.search
        ? {
            $or: [{ instructorId: { $regex: filters.search, $options: "i" } }],
          }
        : {};

      const isUsedFilter = { isUsed: filters.isUsed };

      const query = { ...searchQuery, ...isUsedFilter };
      console.log("Final query:", query);

      const totalCount = await Credential.countDocuments(query);

      const credentials = await Credential.find(query)
        .skip((page - 1) * pageSize) // Offset
        .limit(pageSize) // Tamanho da página
        .exec();

      return {
        totalCount,
        credentials,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching instructor credentials:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  static async getById(id: string, role: string, userId: string) {
    try {
      if (role !== "ADMIN") {
        const credential = await Credential.findById(id);
        if (!credential) {
          throw new Error("Instructor credential not found");
        }
        return credential;
      } else {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const credential = await Credential.findById(user.instructorId);
        return credential;
      }
    } catch (error) {
      console.error("Error fetching instructor credential by ID:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  static async deleteById(id: string) {
    try {
      const deletedCredential = await Credential.findByIdAndDelete(id);
      if (!deletedCredential) {
        throw new Error("Instructor credential not found");
      }
      if (deletedCredential.isUsed === true) {
        const user = await User.findOne({ instructorId: id });
        if (user) {
          user.instructorId = undefined;
          user.role = roles.ATHLETE;
          await user.save();
        }
        return "Instructor credential deleted successfully and user role updated";
      }

      return "Instructor credential deleted successfully";
    } catch (error) {
      console.error("Error deleting instructor credential by ID:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
