import { Request, Response } from "express";
import { UserService } from "../services/controller/userService";

export const UserController = {

    me: async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await UserService.me(req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar dados do usuário" });
        }
    },

    updateProfile: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const { name, email, phone, birthDate } = req.body;
            
            console.log('[updateProfile] Request body:', JSON.stringify(req.body, null, 2));
            
            const result = await UserService.updateProfile(userId, { 
                name, 
                email,
                phone,
                birthDate
            });
            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar perfil"
            });
        }
    },

    updateAthleteBelt: async (req: Request, res: Response) => {
        try {
            const { athleteId } = req.params;
            const { belt } = req.body;
            const instructorId = req.user.id;

            const result = await UserService.updateAthleteBelt(athleteId, belt, instructorId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao atualizar faixa:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar faixa"
            });
        }
    },

    getAthletes: async (req: Request, res: Response) => {
        try {
            const instructorId = req.user.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await UserService.getAthletes(instructorId, page, limit);
            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar atletas:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar atletas"
            });
        }
    },

    uploadAvatar: async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: "Nenhuma imagem foi enviada" });
                return;
            }

            const userId = req.user.id;
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            const result = await UserService.updateAvatar(userId, avatarUrl);
            
            res.status(200).json({ 
                message: "Avatar atualizado com sucesso",
                avatarUrl 
            });
        } catch (error) {
            res.status(500).json({
                message: error instanceof Error ? error.message : "Erro ao fazer upload do avatar"
            });
        }
    }
};
