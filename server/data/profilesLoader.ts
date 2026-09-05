import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CandidateProfile } from '../../src/types';

const getDirname = () => {
  if (typeof __dirname !== 'undefined') return __dirname;
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const _dirname = getDirname();

let cachedProfiles: CandidateProfile[] | null = null;

export function getProfiles(): CandidateProfile[] {
  if (cachedProfiles) return cachedProfiles;

  const candidatePaths = [
    path.join(process.cwd(), 'profiles.json'),
    path.join(process.cwd(), 'server', 'data', 'profiles.json'),
    path.join(_dirname, '..', '..', 'profiles.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        cachedProfiles = JSON.parse(raw);
        return cachedProfiles || [];
      } catch (err) {
        console.error(`Error reading ${p}:`, err);
      }
    }
  }

  console.warn('profiles.json not found in candidate paths, returning empty array');
  return [];
}
