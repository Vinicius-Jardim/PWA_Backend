import { MonthlyPlan, localization } from "../../models/monthlyPlanModel";

export class MonthlyPlanService{
    static async add(data: { name: string, price: number, description: string, duration: number, weeklyClasses: number, privateLessonsIncluded: boolean, graduationScopes: string[], studentCapacity: number }){
        try{
            console.log(data);
            if (!data.graduationScopes.every(scope => Object.values(localization).includes(scope))) {
                return "Escopo de graduação inválido";
            }
            
            const monthlyPlan = new MonthlyPlan({
                name: data.name,
                price: data.price,
                description: data.description,
                studentCapacity: data.studentCapacity,
                privateLessonsIncluded: data.privateLessonsIncluded,
                weeklyClasses: data.weeklyClasses,
                graduationScopes: data.graduationScopes,
                duration: data.duration,
            });
            await monthlyPlan.save();
            return { message: "Plano mensal adicionado com sucesso" };
        }catch(error){
            throw error;
        }
    }

    static async all(){
        try{
            const monthlyPlans = await MonthlyPlan.find();
            return monthlyPlans;
        }catch(error){
            throw error;
        }
    }

    static async update(
        id: string, 
        data: { 
            name: string, 
            price: number, 
            description: string, 
            duration: number, 
            weeklyClasses: number, 
            privateLessonsIncluded: boolean, 
            graduationScopes: string[], 
            studentCapacity: number 
        }
    ) {
        try {
            if (!data || !id) {
                return { error: "Dados inválidos ou ID não fornecido" };
            }
    
            if (!Array.isArray(data.graduationScopes) || data.graduationScopes.length === 0) {
                return { error: "GraduationScopes deve ser um array não vazio" };
            }
            if (!data.graduationScopes.every(scope => Object.values(localization).includes(scope))) {
                return { error: "Escopo de graduação inválido" };
            }
    
            const monthlyPlan = await MonthlyPlan.findById(id);
            if (!monthlyPlan) {
                return { error: "Plano mensal não encontrado" };
            }
    
            const currentCapacity = monthlyPlan.studentCapacity ?? 0;
            if (data.studentCapacity > currentCapacity) {
                return { error: "Capacidade de alunos excede a capacidade atual" };
            }
    
            const isSame = (
                monthlyPlan.name === data.name &&
                monthlyPlan.price === data.price &&
                monthlyPlan.description === data.description &&
                currentCapacity === data.studentCapacity &&
                monthlyPlan.privateLessonsIncluded === data.privateLessonsIncluded &&
                monthlyPlan.weeklyClasses === data.weeklyClasses &&
                JSON.stringify(monthlyPlan.graduationScopes) === JSON.stringify(data.graduationScopes) &&
                monthlyPlan.duration === data.duration
            );
    
            if (isSame) {
                return { error: "Nenhuma mudança detectada nos dados fornecidos" };
            }
    
            monthlyPlan.name = data.name;
            monthlyPlan.price = data.price;
            monthlyPlan.description = data.description;
            monthlyPlan.studentCapacity = data.studentCapacity;
            monthlyPlan.privateLessonsIncluded = data.privateLessonsIncluded;
            monthlyPlan.weeklyClasses = data.weeklyClasses;
            monthlyPlan.graduationScopes = data.graduationScopes;
            monthlyPlan.duration = data.duration;
    
            await monthlyPlan.save();
            return { message: "Plano mensal atualizado com sucesso" };
        } catch (error) {
            console.error("Erro ao atualizar o plano mensal:", error);
            throw error;
        }
    }
    
    
}