import { NotFoundException } from '@nestjs/common';

export function assertOrgMatch(
  resourceOrgId: number | null,
  requestOrgId: number,
) {
  if (resourceOrgId !== requestOrgId) {
    throw new NotFoundException('Resource not found or not accessible');
  }
}
