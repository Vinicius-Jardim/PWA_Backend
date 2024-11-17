import { Request } from 'express';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const paginate = async <T>(
  model: any,
  query: object,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginationResult<T>> => {
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
