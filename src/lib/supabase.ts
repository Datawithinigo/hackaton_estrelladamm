import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials - no environment variables
const supabaseUrl = 'https://wjqwvnsnliacghigteyv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXd2bnNubGlhY2doaWd0ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjI2NTYsImV4cCI6MjA3ODc5ODY1Nn0.Z0SpW4VaB4RbFm7WgsRI0ss-uMWX0s0qVekFZjX--Ss';

console.log('🔧 Using hardcoded Supabase credentials');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo mode flag
export const isDemoMode = false;

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

// Type for user data with required fields for display
export interface DisplayUser {
  id: string;
  name: string;
  stars: number;
  level: string;
  age: number;
  gender: string;
  email: string;
  auth_user_id?: string;
  orientation?: string;
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
  // Asegurar que visible_on_map sea true por defecto
  const userDataWithDefaults = {
    ...userData,
    visible_on_map: userData.visible_on_map !== undefined ? userData.visible_on_map : true
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([userDataWithDefaults])
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
  console.log('🔍 Looking for user by auth ID:', authUserId);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    console.error('🔍 Error fetching user by auth ID:', error);
    throw error;
  }
  
  console.log('🔍 Found user by auth ID:', data);
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
  console.log('🔍 getCurrentAuthUser called');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('🔍 getCurrentAuthUser result:', { user, error });
    if (error) {
      console.log('🔍 getCurrentAuthUser error:', error);
      throw error;
    }
    return user;
  } catch (error) {
    console.error('🔍 getCurrentAuthUser catch error:', error);
    return null;
  }
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
  console.log('🔐 Starting authentication for:', email);
  console.log('🔐 Password length:', password.length);
  
  try {
    // First, try to sign in
    console.log('🔐 Attempting sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('🔐 Sign in response:', { data: signInData, error: signInError });

    if (signInData.user && !signInError) {
      console.log('🔐 Sign in successful for user:', signInData.user.id);
      return { type: 'signin' as const, user: signInData.user };
    }

    // If sign in fails, try to sign up (new user)
    if (signInError) {
      console.log('🔐 Sign in failed with error:', signInError.message);
      
      if (signInError.message.includes('Invalid login credentials') ||
          signInError.message.includes('Email not confirmed') ||
          signInError.message.includes('User not found')) {
        
        console.log('🔐 Sign in failed, attempting sign up...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        console.log('🔐 Sign up response:', { data: signUpData, error: signUpError });

        if (signUpError) {
          console.error('🔐 Sign up error:', signUpError);
          throw signUpError;
        }
        
        if (!signUpData.user) {
          throw new Error('No user returned from signup');
        }

        console.log('🔐 Sign up successful, user ID:', signUpData.user.id);
        
        // Create user record in our custom users table
        try {
          console.log('🔐 Creating user record in database...');
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

          if (userError) {
            console.error('🔐 User record creation error:', userError);
            // Don't throw here, user might already exist
          } else {
            console.log('🔐 User record created successfully:', userRecord);
          }

        } catch (dbError) {
          console.warn('🔐 User record creation warning:', dbError);
          // Continue anyway, onboarding will handle missing data
        }

        return { type: 'signup' as const, user: signUpData.user, needsOnboarding: true };
      } else {
        // If we get here, there was an actual sign-in error
        console.error('🔐 Authentication failed with error:', signInError);
        throw signInError;
      }
    }

    // This shouldn't happen but just in case
    throw new Error('Unexpected authentication state');
    
  } catch (error) {
    console.error('🔐 Authentication error:', error);
    throw error;
  }
};
