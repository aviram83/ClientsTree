
import { Request, Response } from 'express';
import prisma from '../db';
import { ClientStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userData = {
      email,
      password: passwordHash,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || 'User',
    };

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // If user exists, update their information (acts as a password reset)
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });
      
      // Check if the user has a root node, and create one if not.
      const rootNode = await prisma.treeNode.findFirst({
        where: { userId: updatedUser.id, parentId: null },
      });

      if (!rootNode) {
        await prisma.treeNode.create({
          data: {
            name: `${updatedUser.firstName} ${updatedUser.lastName}`,
            status: ClientStatus.CLIENT,
            userId: updatedUser.id,
            parentId: null,
          },
        });
        console.log(`DEV_INFO: Root node created for existing user ${email}.`);
      } else {
        await prisma.treeNode.update({
          where: { id: rootNode.id },
          data: {
            name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          },
        });
      }

      console.log(`DEV_INFO: User ${email} already existed. Password has been updated.`);
      res.status(200).json({ message: 'User updated successfully. You can now log in.' });
    } else {
      // If user doesn't exist, create them and their root node
      const user = await prisma.user.create({
        data: userData,
      });

      await prisma.treeNode.create({
          data: {
              name: `${user.firstName} ${user.lastName}`,
              status: ClientStatus.CLIENT,
              userId: user.id,
              parentId: null
          }
      });

      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const TOKEN_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hours
    const expiresAt = new Date(Date.now() + TOKEN_DURATION_MS);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, expiresAt });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, language: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
