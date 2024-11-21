import AthleteRoutes from "./routes/athletes";
import UserRoutes from "./routes/userRoutes";
import InstructorCredentialRoutes from "./routes/instructorCredentiaRoutes";


export const router = [
    { path: '/api/athletes', router: AthleteRoutes },
    { path: '/api/user', router: UserRoutes },
    { path: '/api/instructor-credentials', router: InstructorCredentialRoutes },
]