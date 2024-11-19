import AthleteRoutes from "./routes/athletes";
import UserRoutes from "./routes/userRoutes";


export const router = [
    { path: '/api/athletes', router: AthleteRoutes },
    { path: '/api/user', router: UserRoutes },
]