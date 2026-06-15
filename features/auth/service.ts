import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/server/errors';
import { signToken } from './token';
import { LoginInput, RegisterInput } from './schemas';

export async function loginUser(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user || !user.passwordHash || !bcrypt.compareSync(input.password, user.passwordHash)) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin',
    name: user.name,
    avatarUrl: user.avatarUrl,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existing) {
    throw new AppError('CONFLICT', 'Email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const [newUser] = await db
    .insert(users)
    .values({ email: input.email, passwordHash })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      name: users.name,
      avatarUrl: users.avatarUrl,
    });

  const token = signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role as 'user' | 'admin',
    name: newUser.name,
    avatarUrl: newUser.avatarUrl,
  });

  return {
    token,
    user: newUser,
  };
}
