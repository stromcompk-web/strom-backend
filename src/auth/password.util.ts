import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const SALT_LEN = 16;
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN).toString('hex');
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function comparePassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuffer.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}
