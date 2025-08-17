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
  hasPhilosopherMatch?: boolean;
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
  'camus': 'Albert Camus'
};

// Helper function to map backend response to Discussion interface
function mapBackendResponseToDiscussion(response: any): Discussion {
  // If the response has a 'discussion' field, use that
  if (response.discussion) {
    const discussion = response.discussion as Discussion;
    
    // Ensure messages have the correct format
    if (discussion.messages) {
      discussion.messages = discussion.messages.map((msg: any, index) => ({
        id: msg.id || index + 1,
        text: msg.text || msg.content || '',
        sender: msg.sender || (msg.role === 'assistant' ? 'philosopher' : 'user'),
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        isHighlight: msg.isHighlight || false,
        type: msg.type || undefined
      }));
    }
    
    // Set hasPhilosopherMatch based on whether a philosopher is assigned
    discussion.hasPhilosopherMatch = !!discussion.philosopherId && discussion.philosopherId !== '';
    
    return discussion;
  }
  
  // Otherwise, try to map the response fields
  return {
    id: response.conversation_id || response.id || '',
    philosopherId: response.philosopher_id || response.philosopherId || '',
    philosopherName: response.philosopher_name || response.philosopherName || '',
    messages: (response.messages || []).map((msg: any, index: number) => ({
      id: msg.id || index + 1,
      text: msg.text || msg.content || '',
      sender: msg.sender || (msg.role === 'assistant' ? 'philosopher' : 'user'),
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      isHighlight: msg.isHighlight || false,
      type: msg.type || undefined
    })),
    createdAt: response.started_at || response.createdAt || new Date().toISOString(),
    updatedAt: response.updatedAt || new Date().toISOString(),
    title: response.title || 'New Discussion',
    hasPhilosopherMatch: !!(response.philosopher_id || response.philosopherId) && (response.philosopher_id || response.philosopherId) !== ''
  };
}

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

    // Use backend API instead of direct S3 access to avoid CORS issues
    const response = await fetch('/api/users/profile/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userProfile)
    });

    if (!response.ok) {
      throw new Error(`Failed to save profile: ${response.status}`);
    }

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
  
  const { results } = responseData as { results: Record<string, any> };
  
  // Convert the results object to an array and map each discussion
  const mappedDiscussions = Object.entries(results || {}).map(([discussionId, discussionData]) => {
    // Ensure the discussion has an ID
    const discussionWithId = {
      ...discussionData,
      id: discussionId
    };
    
    const mapped = mapBackendResponseToDiscussion(discussionWithId);
    console.log(`Mapped discussion ${mapped.id}:`, {
      hasPhilosopherMatch: mapped.hasPhilosopherMatch,
      philosopherId: mapped.philosopherId,
      philosopherName: mapped.philosopherName
    });
    return mapped;
  });
  
  console.log('Mapped discussions:', mappedDiscussions);
  return mappedDiscussions;
}
export async function sendMessage(discussionId: string, message: Message, currDiscussion: Discussion) {
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId; // Use Identity Pool ID instead of User Pool ID

    // Check if this discussion has a philosopher match
          console.log('Checking discussion for philosopher match:', {
        hasPhilosopherMatch: currDiscussion.hasPhilosopherMatch,
        philosopherId: currDiscussion.philosopherId,
        discussionId: currDiscussion.id,
        currentMessageCount: currDiscussion.messages.length,
        newMessage: message
      });
    
    // Validate that the discussion has the required fields
    if (!currDiscussion.id) {
      console.error('Discussion missing ID:', currDiscussion);
      throw new Error('Discussion missing ID');
    }
    
    // Check if this discussion has a philosopher match
    // Use a fallback check in case hasPhilosopherMatch is not set properly
    const hasPhilosopher = currDiscussion.hasPhilosopherMatch || (currDiscussion.philosopherId && currDiscussion.philosopherId !== '');
    
    console.log('Philosopher match check:', {
      hasPhilosopherMatch: currDiscussion.hasPhilosopherMatch,
      philosopherId: currDiscussion.philosopherId,
      fallbackCheck: hasPhilosopher
    });
    
    if (hasPhilosopher && currDiscussion.philosopherId) {
      // Use the continue_discussion endpoint for philosopher responses
      // Create a new messages array that includes the user's new message
      const updatedMessages = [...currDiscussion.messages, message];
      
      // Validate that the new message is from the user
      if (!message || typeof message !== 'object') {
        console.error('Invalid message object:', message);
        throw new Error('Invalid message object');
      }
      
      if (message.sender !== 'user') {
        console.error('New message is not from user:', message);
        throw new Error('New message must be from user');
      }
      
      console.log('Sending messages to continue_discussion:', {
        originalCount: currDiscussion.messages.length,
        newCount: updatedMessages.length,
        lastMessage: updatedMessages[updatedMessages.length - 1],
        lastMessageSender: updatedMessages[updatedMessages.length - 1].sender
      });
      
      const response = await fetch('/api/discussions/continue/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: identityId,
          discussionId: discussionId,
          messages: updatedMessages,
          philosopher_id: currDiscussion.philosopherId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        console.error('Request that failed:', {
          user_id: identityId,
          discussionId: discussionId,
          messagesCount: updatedMessages.length,
          philosopher_id: currDiscussion.philosopherId
        });
        throw new Error(`Failed to continue discussion: ${response.status} - ${errorText}`);
      }

      // Parse the response to get the updated discussion
      const responseData = await response.json();
      console.log('Discussion continued successfully, backend response:', responseData);
      
      // Validate the response structure
      if (!responseData.discussion) {
        console.error('Backend response missing discussion field:', responseData);
        throw new Error('Invalid backend response: missing discussion field');
      }
      
      // Return the updated discussion data
      return {
        discussionId,
        message,
        updatedDiscussion: responseData.discussion
      };
    }
    
  } catch (error) {
    console.error('Error saving discussion:', error);
    throw error;
  }
}

export async function createDiscussion(discussionId: string, message: Message, philosopher: string): Promise<Discussion | null>{
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId; // Use Identity Pool ID instead of User Pool ID
    console.log('Creating discussion with identityId:', identityId);
    console.log('PHILOSOPHER_NAMES lookup:', PHILOSOPHER_NAMES[philosopher]);
    
    const newDiscussion: Discussion = {
      id: discussionId,
      philosopherId: philosopher == "dilemma" ? "" : philosopher,
      philosopherName: philosopher == "dilemma" ? "" : PHILOSOPHER_NAMES[philosopher],
      messages: philosopher !== "dilemma" ? [
        message,
        {
          id: 2,
          text: `You've been matched with ${PHILOSOPHER_NAMES[philosopher]}!`,
          sender: 'system' as const,
          timestamp: new Date(),
          type: 'philosopher_match'
        }
      ] : [message],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: message.text,
      hasPhilosopherMatch: philosopher !== "dilemma"
    }
    
    console.log('Created discussion object:', newDiscussion);
    
    // Prepare the request body
    const requestBody = {
      user_id: identityId,
      discussionId: discussionId,
      messages: [message] // Only send the user's message, let backend create the rest
    };
    
    console.log('Sending request body to backend:', requestBody);
    console.log('Request body JSON stringified:', JSON.stringify(requestBody));
    
    // Use backend API instead of direct S3 access to avoid CORS issues
    let response;
    try {
      console.log('Making fetch request to:', '/api/discussions/match/');
      response = await fetch('/api/discussions/match/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to save discussion: ${response.status} - ${errorText}`);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }

    // Parse the response to get confirmation from backend
    const responseData = await response.json();
    console.log('Backend response:', responseData);
    
    if (responseData.key) {
      console.log('Discussion saved successfully to S3 key:', responseData.key);
    } else {
      console.warn('Backend succeeded but no S3 key returned');
    }

    // Map the backend response to our Discussion interface
    const mappedDiscussion = mapBackendResponseToDiscussion(responseData);
    console.log('Mapped discussion:', mappedDiscussion);

    console.log('Discussion saved successfully');
    console.log('Returning discussion:', mappedDiscussion);
    return mappedDiscussion
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