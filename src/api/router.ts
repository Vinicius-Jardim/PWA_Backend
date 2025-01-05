import AthleteRoutes from "./routes/athletes";
import UserRoutes from "./routes/userRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import ExamesRoutes from "./routes/exameRoutes";
import MonthlyFeeRoutes from "./routes/monthlyFeeRoutes";
import MonthlyPlanRoutes from "./routes/monthlyPlanRoutes";

export const router = [
  { path: "/api/athletes", router: AthleteRoutes },
  { path: "/api/user", router: UserRoutes },
  { path: "/api/instructors", router: InstructorRoutes },
  { path: "/api/exames", router: ExamesRoutes },
  { path: "/api/monthly-fees", router: MonthlyFeeRoutes },
  { path: "/api/monthly-plans", router: MonthlyPlanRoutes},
];
