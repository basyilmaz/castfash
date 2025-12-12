export interface RequestUser {
  userId: number;
  organizationId: number;
  email: string;
  isSuperAdmin?: boolean;
}
