import User from '../../models/userModel';

export class AthleteService {
  static async getAthletes(
    filters: { role?: string; search?: string } = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      console.log('Initial filters:', filters);

      // Garantir que o filtro role seja 'ATHLETE'
      filters.role = 'ATHLETE';
      console.log('Filters after role assignment:', filters);

      // Se existir um valor para 'search', cria um filtro de busca
      const searchQuery = filters.search
        ? {
            $or: [
              { name: { $regex: filters.search, $options: 'i' } }, // Insensível a maiúsculas/minúsculas
              { email: { $regex: filters.search, $options: 'i' } },
            ],
          }
        : {};
      console.log('Search query:', searchQuery);

      // Construir a query final
      const query = { ...filters, ...searchQuery };
      console.log('Final query:', query);

      // Calcular a quantidade total de documentos que atendem ao filtro
      const totalCount = await User.countDocuments(query);
      console.log('Total count:', totalCount);

      // Obter a lista de atletas com a consulta de paginação
      const athletes = await User.find(query)
        .skip((page - 1) * pageSize) // Calcula o offset
        .limit(pageSize) // Limita os resultados de acordo com o tamanho da página
        .exec();
      console.log('Athletes:', athletes);

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

