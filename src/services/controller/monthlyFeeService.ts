import { MonthlyFee, status } from "../../models/monthlyFeeModel";
import { MonthlyPlan } from "../../models/monthlyPlanModel";
import User from "../../models/userModel";
export class MonthlyFeeService {
    static async createMonthlyFee(studentId: string, planId: string) {
        try {
            // Verifica se o plano existe
            const plan = await MonthlyPlan.findById(planId);
            if (!plan) {
                return { error: "Plano mensal não encontrado" };
            }
    
            // Cria a mensalidade inicial
            const monthlyFee = new MonthlyFee({
                student: studentId,
                plan: planId,
                amount: plan.price,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Define o vencimento para o próximo mês
                status: status.PENDING,
            });
    
            await monthlyFee.save();
    
            return { message: "Mensalidade criada com sucesso", monthlyFee };
        } catch (error) {
            console.error("Erro ao criar mensalidade:", error);
            throw error;
        }
    }

    static async markAsPaid(monthlyFeeId: string, paymentMethod: string) {
        try {
            // Busca a mensalidade pelo ID
            const monthlyFee = await MonthlyFee.findById(monthlyFeeId);
            if (!monthlyFee) {
                return { error: "Mensalidade não encontrada" };
            }
            if (monthlyFee.status === status.PAID) {
                return { error: "Mensalidade já foi paga" };
            }
            // Atualiza os dados de pagamento
            monthlyFee.status = status.PAID;
            monthlyFee.paymentDate = new Date();
            monthlyFee.paymentMethod = paymentMethod;
    
            await monthlyFee.save();
            const user = await User.findById(monthlyFee.student);
            if (!user) {
                return { error: "Usuário não encontrado" };
            }
            // Atualiza o saldo do usuário
            user.monthlyPlan = monthlyFee.plan;
            await user.save();
            return { message: "Mensalidade marcada como paga", monthlyFee };
        } catch (error) {
            console.error("Erro ao atualizar mensalidade:", error);
            throw error;
        }
    }

    static async getOwnMonthlyFees(studentId: string) {
        try {
            // Busca todas as mensalidades do estudante
            const monthlyFees = await MonthlyFee.find({ student: studentId });
    
            return { monthlyFees };
        } catch (error) {
            console.error("Erro ao buscar mensalidades:", error);
            throw error;
        }
    }
    
}
