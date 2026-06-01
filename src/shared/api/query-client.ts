import { QueryClient, MutationCache } from '@tanstack/react-query';

const mutationCache = new MutationCache({
  onSuccess: async (_data, _variables, _context, mutation) => {
    const invalidatesKeys = mutation.meta?.invalidates;

    if (invalidatesKeys && invalidatesKeys.length > 0) {
      await queryClient.invalidateQueries({ queryKey: invalidatesKeys });
    }
  },
});

export const queryClient = new QueryClient({
  mutationCache,
});
