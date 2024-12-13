import User from '../../models/userModel';

export class AthleteService {
  static async getAthletes({ search = "", page = 1, pageSize = 10 }) {
    try {
      // Filtro base para role ATHLETE
      const roleFilter = { role: 'ATHLETE' };

      // Filtro de busca se houver termo de pesquisa
      const searchQuery = search ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      } : {};

      // Query final
      const query = { ...roleFilter, ...searchQuery };

      // Contar total de atletas
      const totalCount = await User.countDocuments(query);

      // Buscar atletas com campos específicos
      const athletes = await User.find(query)
        .select('name email belt createdAt gender age monthlyFee') // Incluindo campos relevantes
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ name: 1 }) // Ordenar por nome
        .lean(); // Converter para objeto JavaScript puro

      return {
        totalCount,
        athletes: athletes.map(athlete => ({
          ...athlete,
          belt: athlete.belt || 'Branca' // Se não tiver faixa, assume Branca
        })),
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching athletes:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
