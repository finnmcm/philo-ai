
interface Philosopher {
    id: string,
    description: string,
    era: string,
    image: string,
    keyWorks: [string],
    name: string,
    quote: string,
    specialties: [string]
}
export type JsonContents = Record<string, Philosopher>;
export async function fetchPhilosophers(): Promise<JsonContents>{
    const API_BASE = import.meta.env.VITE_API_BASE_GET as string;
    console.log(API_BASE);
    const res = await fetch(API_BASE + "/folder?prefix=philosopher_data", {
        method: 'GET',
        headers: { 'Accept': 'application/json'}
    });

    if (!res.ok){
        throw new Error('Failed to fetch contents: ${res.status}');
    }
    const { results } = await res.json() as { results: JsonContents};
    return results;
}
