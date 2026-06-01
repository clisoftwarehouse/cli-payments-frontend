// types/react-query.d.ts
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: string[];
    };
  }
}
