import User, { roles } from "../../models/userModel";
export class InstructorService {
  static async all(
    filters: { search?: string },
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      // Filtro de pesquisa (se houver)
      const searchQuery = filters.search
        ? {
            $or: [{ name: { $regex: filters.search, $options: "i" } }],
          }
        : {};

      const query = { ...searchQuery };

      // Contagem total de documentos
      const totalCount = await User.countDocuments(query);
      // Consulta com paginação
      const instructors = await User.find({ ...query, role: roles.INSTRUCTOR })
        .skip((page - 1) * pageSize) // Offset
        .limit(pageSize) // Tamanho da página
        .exec();
      return {
        totalCount,
        instructors,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error in getAll service:", error);
      return { message: "An unexpected error occurred" };
    }
  }

  static async joinInstructor(id: string, userId: string) {
    try {
      // Encontrar o instrutor
      const instructor = await User.findOne({
        _id: id,
        role: roles.INSTRUCTOR,
      });
      if (!instructor) {
        return { message: "Instructor not found" };
      }

      // Associar instrutor ao usuário
      const user = await User.findOne({ _id: userId, role: roles.ATHLETE });
      if (!user) {
        return { message: "User not found" };
      }
      if ((user.instructorId = instructor._id)) {
        return { message: "User is already associated with this instructor" };
      }
      if (!instructor.athletes) {
        instructor.athletes = [];
      }
      instructor.athletes.push(user._id);
      user.instructorId = instructor._id;
      await user.save();
      await instructor.save();

      return { message: "Instructor joined successfully" };
    } catch (error) {
      console.error("Error in joinInstructor service:", error);
      return { message: "An unexpected error occurred" };
    }
  }
}
