import axiosClient from '@/shared/api/axios-client';

export const ROLE_ID = {
  admin: 1,
  user: 2,
} as const;

export const STATUS_ID = {
  active: 1,
  inactive: 2,
} as const;

export type UserDto = {
  id: number | string;
  email: string | null;
  provider: string;
  firstName: string | null;
  lastName: string | null;
  role: { id: number; name?: string } | null;
  status: { id: number; name?: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: { id: number };
  status?: { id: number };
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: { id: number };
  status?: { id: number };
};

export type UsersPage = {
  data: UserDto[];
  hasNextPage: boolean;
};

export const usersApi = {
  list: async (params?: { page?: number; limit?: number }): Promise<UsersPage> => {
    const { data } = await axiosClient.get<UsersPage>('/users', {
      params: { page: 1, limit: 50, ...params },
    });
    return data;
  },
  findById: async (id: string | number): Promise<UserDto> => {
    const { data } = await axiosClient.get<UserDto>(`/users/${id}`);
    return data;
  },
  create: async (input: CreateUserInput): Promise<UserDto> => {
    const { data } = await axiosClient.post<UserDto>('/users', input);
    return data;
  },
  update: async (id: string | number, input: UpdateUserInput): Promise<UserDto> => {
    const { data } = await axiosClient.patch<UserDto>(`/users/${id}`, input);
    return data;
  },
  remove: async (id: string | number): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};
