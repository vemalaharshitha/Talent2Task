     import { chatAssistantService } from '../src/services/chatAssistantService.ts';

async function run() {
  const mockRecruiter = { id: 'r1', name: 'Sundar', role: 'recruiter', city: 'Chennai' };
  const payload = {
    currentUser: mockRecruiter,
    jobs: [],
    users: [
      { id: 'w1', name: 'Murugan K', role: 'seeker', city: 'Chennai', skills: ['Electrical', 'Wiring'], rating: 4.8, latitude: 13.08, longitude: 80.27 },
      { id: 'w2', name: 'Suresh Babu', role: 'seeker', city: 'Chennai', skills: ['Electrical', 'Inverter'], rating: 4.7, latitude: 13.08, longitude: 80.27 },
      { id: 'w3', name: 'Velu P', role: 'seeker', city: 'Chennai', skills: ['Painter', 'Painting'], rating: 4.9, latitude: 13.08, longitude: 80.27 }
    ],
    language: 'en' as const,
    history: []
  };

  const entities17 = (chatAssistantService as any).extractEntities('Help me post a gig.', payload);
  console.log('ENTITIES 17:', entities17);

  const entities19 = (chatAssistantService as any).extractEntities('I need 3 electricians and 2 painters.', payload);
  console.log('ENTITIES 19:', entities19);
}

run();
