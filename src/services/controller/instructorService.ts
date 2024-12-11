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
}
