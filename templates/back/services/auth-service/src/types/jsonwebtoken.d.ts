declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: unknown;
    exp?: number;
    iat?: number;
  }

  export interface SignOptions {
    expiresIn?: string | number;
  }

  export class JsonWebTokenError extends Error {}
  export class TokenExpiredError extends JsonWebTokenError {}

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: SignOptions,
  ): string;

  export function verify(token: string, secretOrPublicKey: string): string | JwtPayload;
  export function decode(token: string): null | string | JwtPayload;
}
