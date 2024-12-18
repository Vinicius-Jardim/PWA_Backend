import { Request, Response } from "express";
import { MonthlyPlanService } from "../services/controller/monthlyPlanService";

export const MonthlyPlanController = {
    add: async (req: Request, res: Response) =>{
        try{
            const data = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                studentCapacity: req.body.studentCapacity,
                privateLessonsIncluded: req.body.privateLessonsIncluded,
                weeklyClasses: req.body.weeklyClasses,
                graduationScopes: req.body.graduationScopes,
                duration: req.body.duration,
            }
            const response = await MonthlyPlanService.add(data);
            res.status(200).json(response);
        }catch(error){
            console.error("Erro ao adicionar plano mensal:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao adicionar plano mensal"
            });
        }
    },

    all: async (req: Request, res: Response) =>{
        try{
            const response = await MonthlyPlanService.all();
            res.status(200).json(response);
        }catch(error){
            console.error("Erro ao buscar planos mensais:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar planos mensais"
            });
        }
    },

    update: async (req: Request, res: Response) =>{
        try{
            const data = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                studentCapacity: req.body.studentCapacity,
                privateLessonsIncluded: req.body.privateLessonsIncluded,
                weeklyClasses: req.body.weeklyClasses,
                graduationScopes: req.body.graduationScopes,
                duration: req.body.duration,
            }
            const response = await MonthlyPlanService.update(req.params.id, data);
            res.status(200).json(response);
        }catch(error){
            console.error("Erro ao atualizar plano mensal:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar plano mensal"
            });
        }
    }
}