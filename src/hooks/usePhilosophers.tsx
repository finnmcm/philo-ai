import { useQuery } from '@tanstack/react-query';
import { fetchPhilosophers, JsonContents } from '@/components/api/fetchPhilosophers';

export function usePhilosophers() {
    return useQuery<JsonContents, Error>({
        queryKey: ['philosophers'],
        queryFn: fetchPhilosophers,
        staleTime: 5 * 60_000,         // fresh for 5 minutes
        refetchOnWindowFocus: false,   // no auto-refetch when tab gains focus
        refetchOnMount: false,         // don’t refetch if data is fresh
    })
    
}