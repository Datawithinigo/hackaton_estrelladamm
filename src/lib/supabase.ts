import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id?: string;
  auth_user_id?: string;
  name?: string;
  age?: number;
  gender?: string;
  email?: string;
  orientation?: string;
  stars?: number;
  level?: string;
  profile_photo_url?: string;
  bio?: string;
  visible_on_map?: boolean;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('stars', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getConversation = async (userId: string, otherUserId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const sendMessage = async (senderId: string, recipientId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      recipient_id: recipientId,
      content
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createUser = async (userData: User) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserByAuthId = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAuthUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signUpWithEmail = async (email: string, password: string, userData: { name: string; age: number; gender: string; orientation?: string }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        orientation: userData.orientation
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from signup');

  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .insert([{
      auth_user_id: authData.user.id,
      email: authData.user.email,
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      orientation: userData.orientation,
      stars: 0,
      level: 'Bronce',
      visible_on_map: false
    }])
    .select()
    .single();

  if (userError) throw userError;
  return { authUser: authData.user, userRecord };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const authenticateWithEmail = async (email: string, password: string) => {
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!signInError && signInData.user) {
      return { type: 'signin' as const, user: signInData.user };
    }

    if (signInError?.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('No user returned from signup');

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{
          auth_user_id: signUpData.user.id,
          email: signUpData.user.email,
          stars: 0,
          level: 'Bronce',
          visible_on_map: false
        }])
        .select()
        .single();

      if (userError) throw userError;

      return { type: 'signup' as const, user: signUpData.user, needsOnboarding: true };
    }

    throw signInError;
  } catch (error) {
    throw error;
  }
};
