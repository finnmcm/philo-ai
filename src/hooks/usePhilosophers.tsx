import { useQuery } from '@tanstack/react-query';
import { fetchPhilosophers, JsonContents } from '@/components/api/fetchPhilosophers';

export function usePhilosophers() {
    const query = useQuery<JsonContents, Error>({
        queryKey: ['philosophers'],
        queryFn: fetchPhilosophers,
        staleTime: 5 * 60_000,         // fresh for 5 minutes
        refetchOnWindowFocus: false,   // no auto-refetch when tab gains focus
        refetchOnMount: true,          // always refetch on mount to ensure fresh data
    });
    
    // Debug: Log the query state
    console.log('usePhilosophers query state:', {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        isFetching: query.isFetching,
        isStale: query.isStale,
        dataUpdatedAt: query.dataUpdatedAt
    });
    
    return query;
}