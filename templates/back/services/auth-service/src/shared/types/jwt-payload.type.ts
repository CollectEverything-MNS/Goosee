export interface JwtTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  tokenVersion: number;
  typ: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
