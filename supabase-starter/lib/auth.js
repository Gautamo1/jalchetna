import { supabase } from './supabase';

/**
 * Sign up a new user with Supabase Authentication
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.fullName - User's full name
 * @param {string} userData.phoneNumber - User's phone number
 * @param {string} userData.role - User's role (govt, ngo, researcher)
 * @returns {Promise<Object>} Result object with data or error
 */
export async function signUp({ email, password, fullName, phoneNumber, role }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          role: role
        }
      }
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return { data: null, error: err };
  }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Result object with data or error
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { data: null, error: err };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Result object with error if any
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Sign out error:', err);
    return { error: err };
  }
}

/**
 * Get the current user session
 * @returns {Promise<Object>} Session object or null
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    
    return session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
}

/**
 * Get the current user
 * @returns {Promise<Object>} User object or null
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

/**
 * Update user metadata
 * @param {Object} metadata - User metadata to update
 * @returns {Promise<Object>} Result object with data or error
 */
export async function updateUserMetadata(metadata) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Update user metadata error:', err);
    return { data: null, error: err };
  }
}

/**
 * Reset password for a user
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Result object with data or error
 */
export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Reset password error:', err);
    return { data: null, error: err };
  }
}
