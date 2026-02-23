import "next-auth";
import "next-auth/jwt";
import { Role, Curriculum } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      curriculum?: Curriculum | null;
      avatar?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    curriculum?: Curriculum | null;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    curriculum?: Curriculum | null;
    avatar?: string | null;
  }
}
