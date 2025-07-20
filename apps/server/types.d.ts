declare module 'express' {
  export = express;
}

declare module 'cors' {
  export = cors;
}

// Global type declarations for Express
declare global {
  namespace Express {
    interface Request {
      method: string;
      path: string;
      query: any;
      body: any;
      params: any;
    }
    interface Response {
      json: (data: any) => void;
      status: (code: number) => Response;
      send: (data: any) => void;
      sendFile: (path: string) => void;
    }
  }
}

export {}; 