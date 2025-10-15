// Authentication helpers

import { supabase, getCurrentUser, getUserRole } from './supabase';
import { UserRole, UserRoleRecord } from './types';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Sign up new user with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current authenticated user with role
 */
export async function getCurrentUserWithRole(): Promise<{
  user: any;
  role: UserRoleRecord;
} | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const role = await getUserRole(user.id);
  
  if (!role) {
    return null;
  }
  
  return { user, role };
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userWithRole = await getCurrentUserWithRole();
  
  if (!userWithRole) {
    return false;
  }
  
  return requiredRoles.includes(userWithRole.role.role);
}

/**
 * Check if user is a brewer
 */
export async function isBrewer(): Promise<boolean> {
  return hasRole(['BREWER']);
}

/**
 * Check if user is a driver
 */
export async function isDriver(): Promise<boolean> {
  return hasRole(['DRIVER']);
}

/**
 * Check if user is a restaurant manager
 */
export async function isRestaurantManager(): Promise<boolean> {
  return hasRole(['RESTAURANT_MANAGER']);
}

/**
 * Get user's brewery ID (for brewers)
 */
export async function getUserBreweryId(): Promise<string | null> {
  const userWithRole = await getCurrentUserWithRole();
  
  if (!userWithRole || userWithRole.role.role !== 'BREWER') {
    return null;
  }
  
  return userWithRole.role.brewery_id;
}

/**
 * Get user's location ID (for restaurant managers and drivers)
 */
export async function getUserLocationId(): Promise<string | null> {
  const userWithRole = await getCurrentUserWithRole();
  
  if (!userWithRole) {
    return null;
  }
  
  return userWithRole.role.location_id;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    throw new Error(error.message);
  }
}
