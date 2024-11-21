import User from '../../models/userModel';

export class AthleteService {
  static async getAthletes(
    filters: { role?: string; search?: string } = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    try {

      // Garantir que o filtro role seja 'ATHLETE'
      const roleFilter = { role: 'ATHLETE'};

      // Se existir um valor para 'search', cria um filtro de busca
      const searchQuery = filters.search
        ? {
            $or: [
              { name: { $regex: filters.search, $options: 'i' } },
              { email: { $regex: filters.search, $options: 'i' } },
            ],
          }
        : {};

      // Construir a query final
      const query = { ...roleFilter, ...searchQuery };

      // Calcular a quantidade total de documentos que atendem ao filtro
      const totalCount = await User.countDocuments(query);

      // Obter a lista de atletas com a consulta de paginação
      const athletes = await User.find(query)
        .skip((page - 1) * pageSize) // Calcula o offset
        .limit(pageSize) // Limita os resultados de acordo com o tamanho da página
        .exec();

      // Retornar a resposta com os dados de paginação
      return {
        totalCount,
        athletes,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching athletes:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}

