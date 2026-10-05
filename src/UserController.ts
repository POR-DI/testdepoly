import { Request, Response } from 'express';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import mongoose from 'mongoose';
import User from './User';
import { Utils } from './Utils';

const scryptAsync = promisify(scrypt);
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

function fail(res: Response, error: unknown): void {
  if ((error as { code?: number })?.code === 11000) {
    res.status(409).json({ message: 'Email already exists' });
  } else if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid user data' });
  } else {
    res.status(500).json({ message: 'Database operation failed' });
  }
}

function validId(req: Request, res: Response): boolean {
  if (typeof req.params.id !== 'string' || !mongoose.isObjectIdOrHexString(req.params.id)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return false;
  }
  return true;
}

async function userData(body: unknown, partial = false): Promise<Record<string, string>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body');
  const input = body as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const field of ['name', 'email', 'password']) {
    if (partial && input[field] === undefined) continue;
    if (typeof input[field] !== 'string' || !input[field].trim()) throw new Error(`${field} is required`);
    result[field] = field === 'password' ? input[field] : input[field].trim();
  }
  if (!Object.keys(result).length) throw new Error('No user fields supplied');
  if (result.email && !Utils.isValidEmail(result.email)) throw new Error('Invalid email');
  if (result.password) result.password = await hashPassword(result.password);
  return result;
}

export const createUser = async (req: Request, res: Response) => {
  let data: Record<string, string>;
  try { data = await userData(req.body); }
  catch (error) { res.status(400).json({ message: (error as Error).message }); return; }
  try { res.status(201).json(await User.create(data)); }
  catch (error) { fail(res, error); }
};

export const getUsers = async (_req: Request, res: Response) => {
  try { res.json(await User.find()); }
  catch (error) { fail(res, error); }
};

export const getUserById = async (req: Request, res: Response) => {
  if (!validId(req, res)) return;
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (error) { fail(res, error); }
};

export const updateUser = async (req: Request, res: Response) => {
  if (!validId(req, res)) return;
  let data: Record<string, string>;
  try { data = await userData(req.body, true); }
  catch (error) { res.status(400).json({ message: (error as Error).message }); return; }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (error) { fail(res, error); }
};

export const deleteUser = async (req: Request, res: Response) => {
  if (!validId(req, res)) return;
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ message: 'User deleted' });
  } catch (error) { fail(res, error); }
};
