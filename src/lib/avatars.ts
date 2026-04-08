import avatarLevel0 from '@/assets/avatar-level-0.png';
import avatarLevel1 from '@/assets/avatar-level-1.png';
import avatarLevel2 from '@/assets/avatar-level-2.png';
import avatarLevel3 from '@/assets/avatar-level-3.png';
import avatarLevel4 from '@/assets/avatar-level-4.png';
import avatarLevel5 from '@/assets/avatar-level-5.png';
import avatarLevel6 from '@/assets/avatar-level-6.png';
import avatarLevel7 from '@/assets/avatar-level-7.png';
import avatarCorrupted from '@/assets/avatar-corrupted.png';

export const AVATAR_IMAGES: Record<number, string> = {
  0: avatarLevel0,
  7: avatarLevel1,
  14: avatarLevel2,
  30: avatarLevel3,
  60: avatarLevel4,
  90: avatarLevel5,
  180: avatarLevel6,
  365: avatarLevel7,
};

export const AVATAR_CORRUPTED = avatarCorrupted;

export function getAvatarForStreak(streak: number): string {
  const thresholds = Object.keys(AVATAR_IMAGES).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (streak >= t) return AVATAR_IMAGES[t];
  }
  return AVATAR_IMAGES[0];
}
