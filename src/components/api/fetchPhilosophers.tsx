
interface Philosopher {
    id: string,
    description: string,
    era: string,
    image: string,
    keyWorks: string[],
    name: string,
    quote: string,
    specialties: string[]
}
export type JsonContents = Record<string, Philosopher>;
export async function fetchPhilosophers(): Promise<JsonContents> {
  try {
    const res = await fetch("/api/get/folder?prefix=philosopher_data", {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.log('res', res);
      throw new Error(`Failed to fetch contents: ${res.status}`);
    }

    const responseData = await res.json();
    
    // Extract the actual data from the 'results' wrapper
    const data = responseData.results;
    
    // Validate that the data has the expected structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received from server - missing results field');
    }
    
    // Check if any philosopher objects are missing required properties
    for (const [key, philosopher] of Object.entries(data)) {
      if (!philosopher || typeof philosopher !== 'object') {
        console.warn(`Invalid philosopher data for key: ${key}`);
        continue;
      }
      
      const requiredProps = ['id', 'name', 'description', 'era', 'specialties', 'keyWorks'];
      for (const prop of requiredProps) {
        if (!(prop in philosopher)) {
          console.warn(`Missing required property '${prop}' for philosopher: ${key}`);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching philosophers:', error);
    throw error;
  }
}
