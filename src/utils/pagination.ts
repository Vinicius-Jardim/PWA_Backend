import { Model } from 'mongoose';

export interface PaginationResult<T> {
  data: T[]; // Dados retornados
  total: number; // Total de documentos correspondentes à consulta
  page: number; // Página atual
  pageSize: number; // Tamanho da página
  totalPages: number; // Total de páginas disponíveis
}

export const paginate = async <T>(
  model: Model<T>, // Tipo do modelo do Mongoose
  query: Record<string, any> = {}, // Filtros para a consulta
  page: number = 1, // Página atual (padrão: 1)
  pageSize: number = 10 // Tamanho da página (padrão: 10)
): Promise<PaginationResult<T>> => {
  console.log();  
  const total = await model.countDocuments(query);
  
  const totalPages = Math.ceil(total / pageSize);

  const data = await model
    .find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize); 

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
};
