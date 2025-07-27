import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Message } from '../ChatInterface';
import { useUserDiscussions } from '@/hooks/useUserData';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
  conversations?: string[]; // Array of conversation IDs
  favoritePhilosophers?: string[]; // Array of philosopher IDs
}

export interface Discussion {
  id: string;
  philosopherId: string;
  philosopherName: string;
  messages: Array<Message>;
  createdAt: string;
  updatedAt: string;
  title: string;
}

export const PHILOSOPHER_NAMES: Record<string, string> = {
  'aristotle': 'Aristotle',
  'kant': 'Immanuel Kant',
  'mill': 'John Stuart Mill',
  'nietzsche': 'Friedrich Nietzsche',
  'confucius': 'Confucius',
  'epicurus': 'Epicurus',
  'plato': 'Plato',
  'socrates': 'Socrates',
  'stoic': 'Marcus Aurelius',
  'bentham': 'Jeremy Bentham',
  'hume': 'David Hume',
  'locke': 'John Locke',
  'rousseau': 'Jean-Jacques Rousseau',
  'voltaire': 'Voltaire',
  'spinoza': 'Baruch Spinoza',
  'descartes': 'René Descartes',
  'hegel': 'Georg Wilhelm Friedrich Hegel',
  'schopenhauer': 'Arthur Schopenhauer',
  'kierkegaard': 'Søren Kierkegaard',
  'marx': 'Karl Marx',
  'sartre': 'Jean-Paul Sartre',
  'camus': 'Albert Camus',
  'foucault': 'Michel Foucault',
  'derrida': 'Jacques Derrida',
  'wittgenstein': 'Ludwig Wittgenstein',
  'russell': 'Bertrand Russell',
  'popper': 'Karl Popper',
  'rawls': 'John Rawls',
  'nozick': 'Robert Nozick',
  'nussbaum': 'Martha Nussbaum',
  'sen': 'Amartya Sen',
  'chomsky': 'Noam Chomsky',
  'zizek': 'Slavoj Žižek',
  'butler': 'Judith Butler',
  'haraway': 'Donna Haraway',
  'latour': 'Bruno Latour',
  'deleuze': 'Gilles Deleuze',
  'guattari': 'Félix Guattari'
};

const API_GET_BASE = import.meta.env.VITE_API_BASE_GET as string;
const API_PUT_BASE = import.meta.env.VITE_API_BASE_PUT as string;

// Save user profile data
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId; // Use Identity Pool ID instead of User Pool ID
    
    const userProfile: UserProfile = {
      id: identityId,
      email: profile.email || '',
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      preferences: profile.preferences || {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversations: profile.conversations || [],
      favoritePhilosophers: profile.favoritePhilosophers || []
    };

    await uploadData({
      key: `users/${identityId}/profile.json`, // Use Identity Pool ID
      data: JSON.stringify(userProfile),
      options: {
        contentType: 'application/json',
        accessLevel: 'private'
      }
    });

    console.log('User profile saved successfully');
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}
export async function getUserProfile(identityId: string): Promise<UserProfile | null> {
    const res = await fetch(API_GET_BASE + `/users/?id=${identityId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json'}
    });

    if (!res.ok){
        throw new Error('Failed to fetch contents: ${res.status}');
    }
    const { results } = await res.json() as { results: UserProfile};
    return results;
}
export async function getUserDiscussions(identityId: string): Promise<Discussion[]>{
  console.log('Fetching discussions for identityId:', identityId);
  const res = await fetch(API_GET_BASE + `/discussions/?id=${identityId}`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
  });
  
  // Handle 404 (no discussions found) gracefully
  if (res.status === 404) {
    console.log('No discussions found for user, returning empty array');
    return [];
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch conversations')
  }
  
  const responseData = await res.json();
  console.log('Raw response from backend:', responseData);
  
  const { results } = responseData as { results: Discussion[] };
  
  return results || [];
}
export async function sendMessage(discussionId: string, message: Message, currDiscussion: Discussion) {
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId; // Use Identity Pool ID instead of User Pool ID

    currDiscussion.messages.push(message);
    const filename = discussionId + ".json";
    await uploadData({
      key: `discussions/${identityId}/${filename}`,
      data: JSON.stringify(currDiscussion),
      options: {
        contentType: 'application/json',
        accessLevel: 'private'
      }
    });
    
  } catch (error) {
    console.error('Error saving discussion:', error);
    throw error;
  }
  return {discussionId, message}
}

export async function createDiscussion(discussionId: string, message: Message, philosopher: string): Promise<Discussion | null>{
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId; // Use Identity Pool ID instead of User Pool ID
    
    console.log('Creating discussion with philosopher:', philosopher);
    console.log('PHILOSOPHER_NAMES lookup:', PHILOSOPHER_NAMES[philosopher]);
    
    const newDiscussion: Discussion = {
      id: discussionId,
      philosopherId: philosopher == "dilemma" ? "" : philosopher,
      philosopherName: philosopher == "dilemma" ? "" : PHILOSOPHER_NAMES[philosopher],
      messages: [message],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: message.text
    }
    
    console.log('Created discussion object:', newDiscussion);
    const filename = discussionId + ".json";
    await uploadData({
      key: `discussions/${identityId}/${filename}`, // Use Identity Pool ID
      data: JSON.stringify(newDiscussion),
      options: {
        contentType: 'application/json',
        accessLevel: 'private'
      }
    });

    console.log('Discussion saved successfully');
    console.log('Returning discussion:', newDiscussion);
    return newDiscussion
  } catch (error) {
    console.error('Error saving discussion:', error);
    throw error;
  }
}
/*
// Get user profile data
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser.userId;
    
    const url = await getUrl({
      key: `users/${userId}/profile.json`,
      options: {
        accessLevel: 'private'
      }
    });

    const response = await fetch(url.url);
    if (!response.ok) {
      return null; // Profile doesn't exist yet
    }

    const profile = await response.json();
    return profile as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Save conversation data
export async function saveConversation(conversation: ConversationData): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser.userId;
    
    await uploadData({
      key: `users/${userId}/conversations/${conversation.id}.json`,
      data: JSON.stringify(conversation),
      options: {
        contentType: 'application/json',
        accessLevel: 'private'
      }
    });

    console.log('Conversation saved successfully');
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

// Get all user conversations
export async function getUserConversations(): Promise<ConversationData[]> {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser.userId;
    
    // Note: This is a simplified version. In a real app, you might want to use
    // a database or list objects to get all conversations
    const url = await getUrl({
      key: `users/${userId}/conversations/`,
      options: {
        accessLevel: 'private'
      }
    });

    const response = await fetch(url.url);
    if (!response.ok) {
      return [];
    }

    // This would need to be implemented based on your storage structure
    // For now, returning empty array
    return [];
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      throw new Error('User profile not found');
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Delete user data (for account deletion)
export async function deleteUserData(): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser.userId;
    
    // Delete profile
    await remove({
      key: `users/${userId}/profile.json`,
      options: {
        accessLevel: 'private'
      }
    });

    // Note: You would also delete conversations and other user data here
    console.log('User data deleted successfully');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
} */