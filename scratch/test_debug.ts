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

  const res17 = await chatAssistantService.handleQuery('Help me post a gig.', payload);
  console.log('RES 17 Text:', res17.text);
  console.log('RES 17 Intent:', res17.intent);
  console.log('RES 17 Actions:', res17.actions);

  const res19 = await chatAssistantService.handleQuery('I need 3 electricians and 2 painters.', payload);
  console.log('RES 19 Text:', res19.text);
  console.log('RES 19 Intent:', res19.intent);
  console.log('RES 19 Actions:', res19.actions);
}

run();
