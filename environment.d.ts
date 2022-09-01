declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_STRING: string;
      PORT_NUMBER: string;
    }
  }
}

export {};
