'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as api from './api';

// Queries
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: api.getSession,
  });
}

export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: api.getUser,
  });
}

// Mutations
export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.signInWithEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
}

export function useSocialLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.signInWithOAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.signUpWithEmail, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.signOut,
    onSuccess: () => {
      queryClient.clear(); 
    },
  });
}
