import { Injectable } from "@nestjs/common";
import type { User } from "@iec-hub/shared";

@Injectable()
export class UsersService {
  async findById(_id: string): Promise<User | null> {
    // TODO: query users table
    return null;
  }
}

