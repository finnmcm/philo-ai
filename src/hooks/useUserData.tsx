import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { getUserDiscussions, getUserProfile, saveUserProfile, UserProfile } from '@/components/api/userStorage';
import { Discussion } from '@/components/api/userStorage';
export function useCurrentUser() {
    
    return useQuery({
      queryKey: ['currentUser'],
      queryFn: getCurrentUser,
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    });
  }

// Hook to get the current identity pool ID
export function useIdentityId() {
  const {isAuthenticated} = useAuthenticated();
    
  return useQuery({
    queryKey: ['identityId'],
    queryFn: async () => {
        if(!isAuthenticated){
            console.log('useIdentityId - not authenticated, returning null');
            return null;
        }
      const session = await fetchAuthSession();
      return session.identityId;
    },
    enabled: isAuthenticated, // Only run when authenticated
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useUserProfile() {
  const { data: identityId } = useIdentityId();

  return useQuery({
    queryKey: ['userProfile', identityId],
    queryFn: () => getUserProfile(identityId),
    enabled: !!identityId, // Only run if identityId is available
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useUserDiscussions() {
    const { data: identityId, isLoading: identityLoading } = useIdentityId();
    
    console.log('useUserDiscussions - identityId:', identityId, 'enabled:', !!identityId, 'identityLoading:', identityLoading);
    
    const query = useQuery({
      queryKey: ['userDiscussions', identityId],
      queryFn: () => {
        console.log('useUserDiscussions - queryFn called with identityId:', identityId);
        return identityId ? getUserDiscussions(identityId) : [];
      },
      enabled: !!identityId, // Only enabled when identityId is available
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      select: (data) => {
        console.log('useUserDiscussions - select called with data:', data);
        const result = data ?? [];
        return result;
      },
    });
    
    console.log('useUserDiscussions - query result:', {
      data: query.data,
      isLoading: query.isLoading,
      error: query.error,
      isSuccess: query.isSuccess
    });
    
    return query;
  }

// Manual refetch function
export function useRefetchUserDiscussions() {
  const queryClient = useQueryClient();
  const { data: identityId } = useIdentityId();
  
  const refetch = () => {
    if (identityId) {
      queryClient.invalidateQueries({ queryKey: ['userDiscussions', identityId] });
    }
  };
  
  return { refetch };
}

export function useCreateDiscussion() {
  const queryClient = useQueryClient();
  const { data: identityId } = useIdentityId();
  
  return useMutation({
    mutationFn: async ({ discussionId, message, philosopher }: { discussionId: string; message: any, philosopher: string }) => {
      const { createDiscussion } = await import('@/components/api/userStorage');
      return createDiscussion(discussionId, message, philosopher);
    },
    onSuccess: (newDiscussion) => {
      
      if (newDiscussion && identityId) {
        // Force update the cache with the new discussion
        queryClient.setQueryData(['userDiscussions', identityId], (oldData: any) => {
          console.log('Old cache data in setQueryData:', oldData);
          
          // Convert oldData to array if it's an object
          let existingDiscussions: any[] = [];
          if (Array.isArray(oldData)) {
            existingDiscussions = oldData;
          } else if (oldData && typeof oldData === 'object') {
            existingDiscussions = Object.values(oldData);
          }
          
          const newData = [...existingDiscussions, newDiscussion];
          console.log('New cache data:', newData);
          return newData;
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create discussion:', error);
    }
  });
}

export function useUpdateDiscussion() {
  const queryClient = useQueryClient();
  const { data: identityId } = useIdentityId();
  
  return useMutation({
    mutationFn: async ({ discussionId, message, currDiscussion }: { discussionId: string; message: any, currDiscussion: Discussion }) => {
      const { sendMessage } = await import('@/components/api/userStorage');
      return sendMessage(discussionId, message, currDiscussion);
    },
    onSuccess: (result, { discussionId, message }) => {
      // Handle the new response format from sendMessage
      if (result && result.updatedDiscussion && identityId) {
        // Update the cache with the new discussion data
        queryClient.setQueryData(['userDiscussions', identityId], (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatedData = Array.isArray(oldData) 
            ? oldData.map(d => d.id === discussionId ? result.updatedDiscussion : d)
            : { ...oldData, [discussionId]: result.updatedDiscussion };
          
          console.log('Updated cache with new discussion data from hook:', updatedData);
          return updatedData;
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update discussion:', error);
    }
  });
}

// Utility hook to refresh user data cache
export function useRefreshUserData() {
  const queryClient = useQueryClient();
  
  const refreshUserData = () => {
    // Invalidate and refetch user data
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };
  
  return { refreshUserData };
}

export function useAuthenticated() {
  const { data: currentUser, isLoading, error } = useCurrentUser();
  
  const isAuthenticated = !!currentUser && !error;  
  return {
    isAuthenticated,
    isLoading,
    user: currentUser,
    error
  };
}