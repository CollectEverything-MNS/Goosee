export class User {
    constructor(
      public readonly id: string,
      public name: string,
      public email: string,
    ) {
      if (!email.includes('@')) {
        throw new Error('Invalid email');
      }
    }
  }
  