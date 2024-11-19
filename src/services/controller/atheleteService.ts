import User from '../../models/userModel';
import { paginate } from '../../utils/pagination';

export class AthleteService {
  static async getAthletes(filters = {}, page: number = 1, pageSize: number = 10) {
    try {
      const result = await paginate(User, filters, page, pageSize);
      return result;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
