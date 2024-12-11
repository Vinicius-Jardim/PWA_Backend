import AthleteRoutes from "./routes/athletes";
import UserRoutes from "./routes/userRoutes";
import InstructorCredentialRoutes from "./routes/instructorCredentiaRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import ExamesRoutes from "./routes/exameRoutes";

export const router = [
  { path: "/api/athletes", router: AthleteRoutes },
  { path: "/api/user", router: UserRoutes },
  { path: "/api/instructor-credentials", router: InstructorCredentialRoutes },
  { path: "/api/instructors", router: InstructorRoutes },
  { path: "/api/exames", router: ExamesRoutes },
];
