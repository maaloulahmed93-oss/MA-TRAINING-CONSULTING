import { User } from "../types/index";

// Mock user for development
export const MOCK_USER: User = {
  id: "1",
  email: "admin@matc.com",
  name: "Administrateur MATC",
  role: "admin",
  createdAt: new Date(),
  lastLogin: new Date(),
};
