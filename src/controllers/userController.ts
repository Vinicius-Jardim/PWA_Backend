import { Request, Response } from "express";
import { UserService } from "../services/controller/userService";

export const UserController = {

    me: async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await UserService.me(req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user data", error });
        }
    }
};
