export interface JwtPayload {
  sub: number;
  organizationId: number;
  email: string;
  isSuperAdmin?: boolean;
}
