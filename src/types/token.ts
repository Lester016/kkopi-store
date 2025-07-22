export type DecodedToken = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    verified: boolean;
  };
  iat: number;
  exp: number;
};
