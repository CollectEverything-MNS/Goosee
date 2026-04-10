declare module 'jsonwebtoken' {
  export class JsonWebTokenError extends Error {}
  export class TokenExpiredError extends JsonWebTokenError {}
  export function verify(token: string, secretOrPublicKey: string): unknown;
}
