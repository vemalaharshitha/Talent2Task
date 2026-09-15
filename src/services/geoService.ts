import type { TamilNaduLocation } from '../types';

export interface TamilNaduCity {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  isPopular?: boolean;
}

/**
 * Comprehensive List of All 38 Districts and Key Urban Hubs across Tamil Nadu
 */
export const TAMIL_NADU_CITIES: TamilNaduCity[] = [
  { id: 'ariyalur', name: 'Ariyalur', district: 'Ariyalur', lat: 11.1401, lng: 79.0786 },
  { id: 'chengalpattu', name: 'Chengalpattu', district: 'Chengalpattu', lat: 12.6841, lng: 79.9836 },
  { id: 'chennai', name: 'Chennai', district: 'Chennai', lat: 13.0827, lng: 80.2707, isPopular: true },
  { id: 'coimbatore', name: 'Coimbatore', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, isPopular: true },
  { id: 'cuddalore', name: 'Cuddalore', district: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
  { id: 'dharmapuri', name: 'Dharmapuri', district: 'Dharmapuri', lat: 12.1211, lng: 78.1582 },
  { id: 'dindigul', name: 'Dindigul', district: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { id: 'erode', name: 'Erode', district: 'Erode', lat: 11.3410, lng: 77.7172, isPopular: true },
  { id: 'hosur', name: 'Hosur', district: 'Krishnagiri', lat: 12.7409, lng: 77.8253, isPopular: true },
  { id: 'kallakurichi', name: 'Kallakurichi', district: 'Kallakurichi', lat: 11.7383, lng: 78.9633 },
  { id: 'kanchipuram', name: 'Kanchipuram', district: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { id: 'kanyakumari', name: 'Kanyakumari (Nagercoil)', district: 'Kanyakumari', lat: 8.1833, lng: 77.4119, isPopular: true },
  { id: 'karaikudi', name: 'Karaikudi', district: 'Sivaganga', lat: 10.0667, lng: 78.7833 },
  { id: 'karur', name: 'Karur', district: 'Karur', lat: 10.9601, lng: 78.0766 },
  { id: 'kodaikanal', name: 'Kodaikanal', district: 'Dindigul', lat: 10.2381, lng: 77.4892 },
  { id: 'krishnagiri', name: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5186, lng: 78.2137 },
  { id: 'kumbakonam', name: 'Kumbakonam', district: 'Thanjavur', lat: 10.9602, lng: 79.3845 },
  { id: 'madurai', name: 'Madurai', district: 'Madurai', lat: 9.9252, lng: 78.1198, isPopular: true },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', district: 'Mayiladuthurai', lat: 11.1075, lng: 79.6525 },
  { id: 'nagapattinam', name: 'Nagapattinam', district: 'Nagapattinam', lat: 10.7656, lng: 79.8428 },
  { id: 'namakkal', name: 'Namakkal', district: 'Namakkal', lat: 11.2189, lng: 78.1674 },
  { id: 'neyveli', name: 'Neyveli', district: 'Cuddalore', lat: 11.5989, lng: 79.4867 },
  { id: 'nilgiris', name: 'Nilgiris (Ooty)', district: 'The Nilgiris', lat: 11.4102, lng: 76.7032, isPopular: true },
  { id: 'perambalur', name: 'Perambalur', district: 'Perambalur', lat: 11.2333, lng: 78.8833 },
  { id: 'pollachi', name: 'Pollachi', district: 'Coimbatore', lat: 10.6583, lng: 77.0083 },
  { id: 'pudukkottai', name: 'Pudukkottai', district: 'Pudukkottai', lat: 10.3833, lng: 78.8001 },
  { id: 'ramanathapuram', name: 'Ramanathapuram', district: 'Ramanathapuram', lat: 9.3639, lng: 78.8395 },
  { id: 'rameswaram', name: 'Rameswaram', district: 'Ramanathapuram', lat: 9.2881, lng: 79.3174 },
  { id: 'ranipet', name: 'Ranipet', district: 'Ranipet', lat: 12.9272, lng: 79.3330 },
  { id: 'salem', name: 'Salem', district: 'Salem', lat: 11.6643, lng: 78.1460, isPopular: true },
  { id: 'sivaganga', name: 'Sivaganga', district: 'Sivaganga', lat: 9.8433, lng: 78.4809 },
  { id: 'sivakasi', name: 'Sivakasi', district: 'Virudhunagar', lat: 9.4533, lng: 77.7944 },
  { id: 'tenkasi', name: 'Tenkasi', district: 'Tenkasi', lat: 8.9594, lng: 77.3150 },
  { id: 'thanjavur', name: 'Thanjavur', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, isPopular: true },
  { id: 'theni', name: 'Theni', district: 'Theni', lat: 10.0104, lng: 77.4768 },
  { id: 'thoothukudi', name: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348, isPopular: true },
  { id: 'tirunelveli', name: 'Tirunelveli', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, isPopular: true },
  { id: 'tirupathur', name: 'Tirupathur', district: 'Tirupathur', lat: 12.4958, lng: 78.5678 },
  { id: 'tiruppur', name: 'Tiruppur', district: 'Tiruppur', lat: 11.1085, lng: 77.3411, isPopular: true },
  { id: 'tiruvallur', name: 'Tiruvallur', district: 'Tiruvallur', lat: 13.1437, lng: 79.9079 },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747 },
  { id: 'tiruvarur', name: 'Tiruvarur', district: 'Tiruvarur', lat: 10.7725, lng: 79.6367 },
  { id: 'trichy', name: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, isPopular: true },
  { id: 'vellore', name: 'Vellore', district: 'Vellore', lat: 12.9165, lng: 79.1325, isPopular: true },
  { id: 'viluppuram', name: 'Viluppuram', district: 'Viluppuram', lat: 11.9401, lng: 79.4861 },
  { id: 'virudhunagar', name: 'Virudhunagar', district: 'Virudhunagar', lat: 9.5872, lng: 77.9514 }
];

/**
 * Accurate Landmarks and Regional Hubs for Every District in Tamil Nadu
 */
export const TAMIL_NADU_LOCATIONS: TamilNaduLocation[] = [
  // 1. Chennai
  { id: 'chn_guindy', name: 'Guindy Industrial & Tech Estate', city: 'Chennai', district: 'Chennai', lat: 13.0067, lng: 80.2030, category: 'commercial', popular: true },
  { id: 'chn_tnagar', name: 'T. Nagar Commercial Hub (Pondy Bazaar)', city: 'Chennai', district: 'Chennai', lat: 13.0418, lng: 80.2341, category: 'commercial', popular: true },
  { id: 'chn_central', name: 'Chennai Central & Broadway Bus Terminus', city: 'Chennai', district: 'Chennai', lat: 13.0827, lng: 80.2755, category: 'transit', popular: true },
  { id: 'chn_omr', name: 'OMR Sholinganallur IT Corridor', city: 'Chennai', district: 'Chennai', lat: 12.9010, lng: 80.2279, category: 'commercial', popular: true },
  { id: 'chn_koyambedu', name: 'Koyambedu Wholesale Market & CMBT', city: 'Chennai', district: 'Chennai', lat: 13.0694, lng: 80.1948, category: 'commercial', popular: true },
  { id: 'chn_velachery', name: 'Velachery MRTS & Phoenix Marketcity', city: 'Chennai', district: 'Chennai', lat: 12.9815, lng: 80.2180, category: 'commercial', popular: true },
  { id: 'chn_tambaram', name: 'Tambaram Railway Junction & Sanatorium', city: 'Chennai', district: 'Chennai', lat: 12.9249, lng: 80.1478, category: 'transit', popular: true },
  { id: 'chn_ambattur', name: 'Ambattur Industrial Estate', city: 'Chennai', district: 'Chennai', lat: 13.0983, lng: 80.1620, category: 'industrial', popular: true },

  // 2. Chengalpattu
  { id: 'cpt_junction', name: 'Chengalpattu Junction & Old Bus Stand', city: 'Chengalpattu', district: 'Chengalpattu', lat: 12.6841, lng: 79.9836, category: 'transit', popular: true },
  { id: 'cpt_mwc', name: 'Mahindra World City Tech Hub', city: 'Chengalpattu', district: 'Chengalpattu', lat: 12.7289, lng: 80.0076, category: 'commercial', popular: true },
  { id: 'cpt_maraimalai', name: 'Maraimalai Nagar Industrial SIPCOT', city: 'Chengalpattu', district: 'Chengalpattu', lat: 12.7956, lng: 80.0242, category: 'industrial', popular: false },
  { id: 'cpt_guduvanchery', name: 'Guduvanchery Bus Stand & Market', city: 'Chengalpattu', district: 'Chengalpattu', lat: 12.8465, lng: 80.0617, category: 'commercial', popular: false },

  // 3. Tiruvallur
  { id: 'tlr_collectorate', name: 'Tiruvallur Collectorate & Veeraraghava Temple', city: 'Tiruvallur', district: 'Tiruvallur', lat: 13.1437, lng: 79.9079, category: 'landmark', popular: true },
  { id: 'tlr_avadi', name: 'Avadi Railway Station & HVF Hub', city: 'Tiruvallur', district: 'Tiruvallur', lat: 13.1147, lng: 80.1009, category: 'industrial', popular: true },
  { id: 'tlr_gummidipoondi', name: 'Gummidipoondi SIPCOT Industrial Estate', city: 'Tiruvallur', district: 'Tiruvallur', lat: 13.4072, lng: 80.1311, category: 'industrial', popular: false },

  // 4. Kanchipuram
  { id: 'kpm_busstand', name: 'Kanchipuram Silk Weaver Market & Bus Stand', city: 'Kanchipuram', district: 'Kanchipuram', lat: 12.8342, lng: 79.7036, category: 'commercial', popular: true },
  { id: 'kpm_sriperumbudur', name: 'Sriperumbudur Electronics & Auto SEZ', city: 'Kanchipuram', district: 'Kanchipuram', lat: 12.9699, lng: 79.9405, category: 'industrial', popular: true },
  { id: 'kpm_oragadam', name: 'Oragadam Automobile & Industrial Hub', city: 'Kanchipuram', district: 'Kanchipuram', lat: 12.8389, lng: 79.9575, category: 'industrial', popular: true },

  // 5. Ranipet
  { id: 'rpt_bhel', name: 'Ranipet BHEL & Collectorate Complex', city: 'Ranipet', district: 'Ranipet', lat: 12.9272, lng: 79.3330, category: 'industrial', popular: true },
  { id: 'rpt_arakkonam', name: 'Arakkonam Railway Junction Hub', city: 'Ranipet', district: 'Ranipet', lat: 13.0833, lng: 79.6667, category: 'transit', popular: true },
  { id: 'rpt_arcot', name: 'Arcot Town Bus Stand & Market', city: 'Ranipet', district: 'Ranipet', lat: 12.9056, lng: 79.3314, category: 'commercial', popular: false },

  // 6. Vellore
  { id: 'vel_katpadi', name: 'Katpadi Junction & VIT Campus', city: 'Vellore', district: 'Vellore', lat: 12.9692, lng: 79.1559, category: 'campus', popular: true },
  { id: 'vel_cmc', name: 'CMC Central Hospital & Ida Scudder Rd', city: 'Vellore', district: 'Vellore', lat: 12.9248, lng: 79.1348, category: 'landmark', popular: true },
  { id: 'vel_sathuvachari', name: 'Sathuvachari Collectorate Hub & Phase 2', city: 'Vellore', district: 'Vellore', lat: 12.9366, lng: 79.1685, category: 'commercial', popular: true },
  { id: 'vel_fort', name: 'Vellore Fort & Town Market', city: 'Vellore', district: 'Vellore', lat: 12.9202, lng: 79.1306, category: 'landmark', popular: false },

  // 7. Tirupathur
  { id: 'tpr_busstand', name: 'Tirupathur Collectorate & Railway Station', city: 'Tirupathur', district: 'Tirupathur', lat: 12.4958, lng: 78.5678, category: 'transit', popular: true },
  { id: 'tpr_ambur', name: 'Ambur Leather Cluster & Oomerabad', city: 'Tirupathur', district: 'Tirupathur', lat: 12.7906, lng: 78.7167, category: 'industrial', popular: true },
  { id: 'tpr_vaniyambadi', name: 'Vaniyambadi New Town & Tannery Hub', city: 'Tirupathur', district: 'Tirupathur', lat: 12.6825, lng: 78.6189, category: 'industrial', popular: false },
  { id: 'tpr_jolarpet', name: 'Jolarpettai Railway Junction', city: 'Tirupathur', district: 'Tirupathur', lat: 12.5567, lng: 78.5833, category: 'transit', popular: false },

  // 8. Tiruvannamalai
  { id: 'tvm_temple', name: 'Annamalaiyar Temple & Girivalam Path', city: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, category: 'landmark', popular: true },
  { id: 'tvm_busstand', name: 'Tiruvannamalai Central Bus Stand', city: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.2312, lng: 79.0664, category: 'transit', popular: true },
  { id: 'tvm_arani', name: 'Arani Silk Saree Cluster & Market', city: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.6689, lng: 79.2847, category: 'commercial', popular: false },
  { id: 'tvm_cheyyar', name: 'Cheyyar SIPCOT Industrial Park', city: 'Tiruvannamalai', district: 'Tiruvannamalai', lat: 12.6583, lng: 79.5417, category: 'industrial', popular: false },

  // 9. Viluppuram
  { id: 'vpm_busstand', name: 'Viluppuram New Bus Stand & Junction', city: 'Viluppuram', district: 'Viluppuram', lat: 11.9401, lng: 79.4861, category: 'transit', popular: true },
  { id: 'vpm_tindivanam', name: 'Tindivanam Junction & Mailam Road', city: 'Viluppuram', district: 'Viluppuram', lat: 12.2344, lng: 79.6517, category: 'transit', popular: false },
  { id: 'vpm_gingee', name: 'Gingee Fort & Town Market', city: 'Viluppuram', district: 'Viluppuram', lat: 12.2500, lng: 79.4167, category: 'landmark', popular: false },

  // 10. Kallakurichi
  { id: 'klk_busstand', name: 'Kallakurichi Collectorate & Bus Stand', city: 'Kallakurichi', district: 'Kallakurichi', lat: 11.7383, lng: 78.9633, category: 'commercial', popular: true },
  { id: 'klk_ulundurpet', name: 'Ulundurpet Toll & NH Junction Hub', city: 'Kallakurichi', district: 'Kallakurichi', lat: 11.6917, lng: 79.2883, category: 'transit', popular: false },

  // 11. Cuddalore
  { id: 'cud_port', name: 'Cuddalore Port & Old Town Market', city: 'Cuddalore', district: 'Cuddalore', lat: 11.7480, lng: 79.7714, category: 'commercial', popular: true },
  { id: 'cud_neyveli', name: 'Neyveli NLC Township & Arch Gate', city: 'Neyveli', district: 'Cuddalore', lat: 11.5989, lng: 79.4867, category: 'industrial', popular: true },
  { id: 'cud_chidambaram', name: 'Chidambaram Natarajar Temple & Annamalai Univ', city: 'Cuddalore', district: 'Cuddalore', lat: 11.3992, lng: 79.6936, category: 'campus', popular: true },
  { id: 'cud_panruti', name: 'Panruti Cashew & Jackfruit Market', city: 'Cuddalore', district: 'Cuddalore', lat: 11.7700, lng: 79.5500, category: 'commercial', popular: false },

  // 12. Dharmapuri
  { id: 'dpi_busstand', name: 'Dharmapuri Central Bus Stand & Collectorate', city: 'Dharmapuri', district: 'Dharmapuri', lat: 12.1211, lng: 78.1582, category: 'transit', popular: true },
  { id: 'dpi_harur', name: 'Harur Town Market & Morappur Rd', city: 'Dharmapuri', district: 'Dharmapuri', lat: 12.0622, lng: 78.4950, category: 'commercial', popular: false },
  { id: 'dpi_palacode', name: 'Palacode Agro & Tomato Mandi', city: 'Dharmapuri', district: 'Dharmapuri', lat: 12.3083, lng: 78.0833, category: 'commercial', popular: false },

  // 13. Krishnagiri
  { id: 'kgi_busstand', name: 'Krishnagiri Toll Gate & New Bus Stand', city: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5186, lng: 78.2137, category: 'transit', popular: true },
  { id: 'kgi_hosursipcot', name: 'Hosur SIPCOT Phase 1 & 2 Industrial Area', city: 'Hosur', district: 'Krishnagiri', lat: 12.7409, lng: 77.8253, category: 'industrial', popular: true },
  { id: 'kgi_hosurbus', name: 'Hosur Central Bus Stand & Bagalur Rd', city: 'Hosur', district: 'Krishnagiri', lat: 12.7350, lng: 77.8320, category: 'transit', popular: true },
  { id: 'kgi_bargur', name: 'Bargur Granite & Textile Hub', city: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5500, lng: 78.3667, category: 'industrial', popular: false },

  // 14. Salem
  { id: 'slm_busstand', name: 'New Bus Stand & Meyyanur', city: 'Salem', district: 'Salem', lat: 11.6683, lng: 78.1408, category: 'transit', popular: true },
  { id: 'slm_junction', name: 'Salem Junction Railway Station', city: 'Salem', district: 'Salem', lat: 11.6708, lng: 78.1250, category: 'transit', popular: true },
  { id: 'slm_shevapet', name: 'Shevapet Commercial & Steel Market', city: 'Salem', district: 'Salem', lat: 11.6500, lng: 78.1400, category: 'commercial', popular: true },
  { id: 'slm_attur', name: 'Attur Sago & Tapioca Market', city: 'Salem', district: 'Salem', lat: 11.5956, lng: 78.6017, category: 'commercial', popular: false },

  // 15. Namakkal
  { id: 'nmk_busstand', name: 'Namakkal Poultry & Transport Hub / Bus Stand', city: 'Namakkal', district: 'Namakkal', lat: 11.2189, lng: 78.1674, category: 'commercial', popular: true },
  { id: 'nmk_tiruchengode', name: 'Tiruchengode Rig & Borewell Cluster', city: 'Namakkal', district: 'Namakkal', lat: 11.3800, lng: 77.8900, category: 'industrial', popular: true },
  { id: 'nmk_rasipuram', name: 'Rasipuram Ghee & Weaving Market', city: 'Namakkal', district: 'Namakkal', lat: 11.4667, lng: 78.1667, category: 'commercial', popular: false },

  // 16. Erode
  { id: 'erd_busstand', name: 'Erode Textile Market (Gani Market) & Bus Terminus', city: 'Erode', district: 'Erode', lat: 11.3428, lng: 77.7274, category: 'commercial', popular: true },
  { id: 'erd_perundurai', name: 'Perundurai SIPCOT Industrial Complex', city: 'Erode', district: 'Erode', lat: 11.2758, lng: 77.5833, category: 'industrial', popular: true },
  { id: 'erd_bhavani', name: 'Bhavani Sangameshwarar & Carpet Market', city: 'Erode', district: 'Erode', lat: 11.4500, lng: 77.6833, category: 'commercial', popular: false },
  { id: 'erd_gobi', name: 'Gobichettipalayam Banana & Agro Market', city: 'Erode', district: 'Erode', lat: 11.4544, lng: 77.4339, category: 'commercial', popular: false },

  // 17. Tiruppur
  { id: 'tup_garment', name: 'Tiruppur Garment Center & Avinashi Rd', city: 'Tiruppur', district: 'Tiruppur', lat: 11.1075, lng: 77.3458, category: 'industrial', popular: true },
  { id: 'tup_oldbs', name: 'Tiruppur Old Bus Stand & Kumaran Rd', city: 'Tiruppur', district: 'Tiruppur', lat: 11.1085, lng: 77.3411, category: 'transit', popular: true },
  { id: 'tup_palladam', name: 'Palladam Hi-Tech Weaving & Poultry Hub', city: 'Tiruppur', district: 'Tiruppur', lat: 10.9994, lng: 77.2889, category: 'industrial', popular: false },
  { id: 'tup_udumalaipettai', name: 'Udumalaipettai Bus Stand & Windmill Valley', city: 'Tiruppur', district: 'Tiruppur', lat: 10.5844, lng: 77.2533, category: 'commercial', popular: false },

  // 18. Coimbatore
  { id: 'cbe_gandhipuram', name: 'Gandhipuram Central Bus Stand & Cross Cut Rd', city: 'Coimbatore', district: 'Coimbatore', lat: 11.0183, lng: 76.9644, category: 'transit', popular: true },
  { id: 'cbe_rspuram', name: 'R.S. Puram Commercial Complex', city: 'Coimbatore', district: 'Coimbatore', lat: 11.0094, lng: 76.9507, category: 'commercial', popular: true },
  { id: 'cbe_peelamedu', name: 'Peelamedu Tech Zone / Avinashi Road', city: 'Coimbatore', district: 'Coimbatore', lat: 11.0267, lng: 77.0125, category: 'campus', popular: true },
  { id: 'cbe_saravanampatti', name: 'Saravanampatti IT Corridor (CHIL SEZ)', city: 'Coimbatore', district: 'Coimbatore', lat: 11.0800, lng: 76.9950, category: 'commercial', popular: true },
  { id: 'cbe_pollachi', name: 'Pollachi Central Bus Stand & Coir Market', city: 'Pollachi', district: 'Coimbatore', lat: 10.6583, lng: 77.0083, category: 'commercial', popular: true },

  // 19. The Nilgiris
  { id: 'nil_ooty', name: 'Ooty Charing Cross & Commercial Road', city: 'Nilgiris (Ooty)', district: 'The Nilgiris', lat: 11.4102, lng: 76.7032, category: 'commercial', popular: true },
  { id: 'nil_coonoor', name: 'Coonoor Bedford & Sim\'s Park Hub', city: 'Nilgiris (Ooty)', district: 'The Nilgiris', lat: 11.3533, lng: 76.7950, category: 'landmark', popular: true },
  { id: 'nil_kotagiri', name: 'Kotagiri Bus Stand & Tea Estates', city: 'Nilgiris (Ooty)', district: 'The Nilgiris', lat: 11.4200, lng: 76.8800, category: 'commercial', popular: false },

  // 20. Karur
  { id: 'krr_textile', name: 'Karur Textile Export Park & Bus Stand', city: 'Karur', district: 'Karur', lat: 10.9601, lng: 78.0766, category: 'industrial', popular: true },
  { id: 'krr_junction', name: 'Karur Railway Junction & Jawahar Bazaar', city: 'Karur', district: 'Karur', lat: 10.9570, lng: 78.0820, category: 'commercial', popular: true },

  // 21. Tiruchirappalli (Trichy)
  { id: 'try_central', name: 'Central Bus Stand & Railway Junction', city: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.7938, lng: 78.6854, category: 'transit', popular: true },
  { id: 'try_thillai', name: 'Thillai Nagar Commercial Market', city: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.8242, lng: 78.6841, category: 'commercial', popular: true },
  { id: 'try_srirangam', name: 'Srirangam Ranganathaswamy Temple & Rajagopuram', city: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.8625, lng: 78.6900, category: 'landmark', popular: true },
  { id: 'try_bhel', name: 'BHEL Thuvakudi & NIT Trichy Campus', city: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', lat: 10.7583, lng: 78.8139, category: 'campus', popular: true },

  // 22. Perambalur
  { id: 'pbr_busstand', name: 'Perambalur Collectorate & New Bus Stand', city: 'Perambalur', district: 'Perambalur', lat: 11.2333, lng: 78.8833, category: 'commercial', popular: true },
  { id: 'pbr_mrf', name: 'Elambalur Industrial & MRF Hub', city: 'Perambalur', district: 'Perambalur', lat: 11.2500, lng: 78.9000, category: 'industrial', popular: false },

  // 23. Ariyalur
  { id: 'alr_cement', name: 'Ariyalur Cement Belt & Bus Stand', city: 'Ariyalur', district: 'Ariyalur', lat: 11.1401, lng: 79.0786, category: 'industrial', popular: true },
  { id: 'alr_jayankondam', name: 'Jayankondam Town Market', city: 'Ariyalur', district: 'Ariyalur', lat: 11.2167, lng: 79.3500, category: 'commercial', popular: false },

  // 24. Mayiladuthurai
  { id: 'myd_junction', name: 'Mayiladuthurai Junction & Kaveri Market', city: 'Mayiladuthurai', district: 'Mayiladuthurai', lat: 11.1075, lng: 79.6525, category: 'transit', popular: true },
  { id: 'myd_sirkazhi', name: 'Sirkazhi Town & Bus Stand', city: 'Mayiladuthurai', district: 'Mayiladuthurai', lat: 11.2333, lng: 79.7333, category: 'commercial', popular: false },

  // 25. Nagapattinam
  { id: 'ngp_harbor', name: 'Nagapattinam Port & Collectorate', city: 'Nagapattinam', district: 'Nagapattinam', lat: 10.7656, lng: 79.8428, category: 'transit', popular: true },
  { id: 'ngp_velankanni', name: 'Velankanni Basilica & Beach Rd', city: 'Nagapattinam', district: 'Nagapattinam', lat: 10.6806, lng: 79.8486, category: 'landmark', popular: true },

  // 26. Tiruvarur
  { id: 'tvr_temple', name: 'Tiruvarur Thyagaraja Temple & Car Street', city: 'Tiruvarur', district: 'Tiruvarur', lat: 10.7725, lng: 79.6367, category: 'landmark', popular: true },
  { id: 'tvr_mannargudi', name: 'Mannargudi Rajagopalaswamy Temple & Bus Stand', city: 'Tiruvarur', district: 'Tiruvarur', lat: 10.6667, lng: 79.4500, category: 'commercial', popular: true },

  // 27. Thanjavur
  { id: 'tjv_bigtemple', name: 'Brihadeeswarar Big Temple & Medical College Rd', city: 'Thanjavur', district: 'Thanjavur', lat: 10.7828, lng: 79.1318, category: 'landmark', popular: true },
  { id: 'tjv_busstand', name: 'Thanjavur Old Bus Stand & Palace Grounds', city: 'Thanjavur', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, category: 'transit', popular: true },
  { id: 'tjv_kumbakonam', name: 'Kumbakonam Mahamaham Tank & Brass Market', city: 'Kumbakonam', district: 'Thanjavur', lat: 10.9602, lng: 79.3845, category: 'commercial', popular: true },

  // 28. Pudukkottai
  { id: 'pdk_busstand', name: 'Pudukkottai New Bus Stand & Collectorate', city: 'Pudukkottai', district: 'Pudukkottai', lat: 10.3833, lng: 78.8001, category: 'transit', popular: true },
  { id: 'pdk_aranthangi', name: 'Aranthangi Town & Market Hub', city: 'Pudukkottai', district: 'Pudukkottai', lat: 10.1667, lng: 78.9833, category: 'commercial', popular: false },

  // 29. Dindigul
  { id: 'dgl_rockfort', name: 'Dindigul Lock Market & Rockfort', city: 'Dindigul', district: 'Dindigul', lat: 10.3673, lng: 77.9803, category: 'commercial', popular: true },
  { id: 'dgl_kodaikanal', name: 'Kodaikanal Lake & Coaker\'s Walk', city: 'Kodaikanal', district: 'Dindigul', lat: 10.2381, lng: 77.4892, category: 'landmark', popular: true },
  { id: 'dgl_palani', name: 'Palani Murugan Temple & Bus Stand', city: 'Dindigul', district: 'Dindigul', lat: 10.4500, lng: 77.5167, category: 'landmark', popular: true },

  // 30. Madurai
  { id: 'mdu_meenakshi', name: 'Meenakshi Temple & Town Hall Market', city: 'Madurai', district: 'Madurai', lat: 9.9195, lng: 78.1193, category: 'landmark', popular: true },
  { id: 'mdu_mattuthavani', name: 'Mattuthavani Integrated Bus Terminal', city: 'Madurai', district: 'Madurai', lat: 9.9482, lng: 78.1567, category: 'transit', popular: true },
  { id: 'mdu_periyar', name: 'Periyar Bus Stand & Railway Junction', city: 'Madurai', district: 'Madurai', lat: 9.9172, lng: 78.1118, category: 'transit', popular: true },
  { id: 'mdu_annanagar', name: 'Anna Nagar Commercial Belt', city: 'Madurai', district: 'Madurai', lat: 9.9250, lng: 78.1450, category: 'commercial', popular: false },

  // 31. Theni
  { id: 'thn_busstand', name: 'Theni New Bus Stand & Agro Trading Hub', city: 'Theni', district: 'Theni', lat: 10.0104, lng: 77.4768, category: 'commercial', popular: true },
  { id: 'thn_bodi', name: 'Bodinayakanur Cardamom & Spice Capital', city: 'Theni', district: 'Theni', lat: 10.0167, lng: 77.3500, category: 'commercial', popular: false },

  // 32. Sivaganga
  { id: 'svg_busstand', name: 'Sivaganga Collectorate & Bus Stand', city: 'Sivaganga', district: 'Sivaganga', lat: 9.8433, lng: 78.4809, category: 'transit', popular: true },
  { id: 'svg_karaikudi', name: 'Karaikudi Chettinad Heritage & Alagappa Univ', city: 'Karaikudi', district: 'Sivaganga', lat: 10.0667, lng: 78.7833, category: 'campus', popular: true },

  // 33. Ramanathapuram
  { id: 'rmn_palace', name: 'Ramanathapuram Palace & Collectorate', city: 'Ramanathapuram', district: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, category: 'landmark', popular: true },
  { id: 'rmn_rameswaram', name: 'Rameswaram Ramanathaswamy Temple & Agnitheertham', city: 'Rameswaram', district: 'Ramanathapuram', lat: 9.2881, lng: 79.3174, category: 'landmark', popular: true },

  // 34. Virudhunagar
  { id: 'vdn_mandi', name: 'Virudhunagar Oil & Spice Wholesale Mandi', city: 'Virudhunagar', district: 'Virudhunagar', lat: 9.5872, lng: 77.9514, category: 'commercial', popular: true },
  { id: 'vdn_sivakasi', name: 'Sivakasi Fireworks & Printing Hub', city: 'Sivakasi', district: 'Virudhunagar', lat: 9.4533, lng: 77.7944, category: 'industrial', popular: true },
  { id: 'vdn_rajapalayam', name: 'Rajapalayam Cotton Mills & PACR Area', city: 'Virudhunagar', district: 'Virudhunagar', lat: 9.4500, lng: 77.5500, category: 'industrial', popular: false },

  // 35. Tenkasi
  { id: 'tks_temple', name: 'Tenkasi Kasi Viswanathar Temple & Bus Stand', city: 'Tenkasi', district: 'Tenkasi', lat: 8.9594, lng: 77.3150, category: 'landmark', popular: true },
  { id: 'tks_courtallam', name: 'Courtallam Main Waterfalls Area', city: 'Tenkasi', district: 'Tenkasi', lat: 8.9300, lng: 77.2700, category: 'landmark', popular: true },

  // 36. Tirunelveli
  { id: 'tnv_junction', name: 'Tirunelveli Junction & Market', city: 'Tirunelveli', district: 'Tirunelveli', lat: 8.7292, lng: 77.7126, category: 'transit', popular: true },
  { id: 'tnv_palayamkottai', name: 'Palayamkottai Bus Stand & College Hub', city: 'Tirunelveli', district: 'Tirunelveli', lat: 8.7180, lng: 77.7340, category: 'campus', popular: true },
  { id: 'tnv_nellaiappar', name: 'Nellaiappar Temple & Town Car Street', city: 'Tirunelveli', district: 'Tirunelveli', lat: 8.7280, lng: 77.6890, category: 'landmark', popular: false },

  // 37. Thoothukudi
  { id: 'tht_port', name: 'Thoothukudi VO Chidambaranar Port & Harbor', city: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348, category: 'industrial', popular: true },
  { id: 'tht_busstand', name: 'Central Bus Stand & Great Cotton Road', city: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 8.8050, lng: 78.1450, category: 'transit', popular: true },
  { id: 'tht_tiruchendur', name: 'Tiruchendur Murugan Sea-Shore Temple', city: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 8.4967, lng: 78.1256, category: 'landmark', popular: true },
  { id: 'tht_kovilpatti', name: 'Kovilpatti Kadalai Mittai & Matches Market', city: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', lat: 9.1700, lng: 77.8700, category: 'commercial', popular: false },

  // 38. Kanyakumari
  { id: 'kk_vadasery', name: 'Nagercoil Vadasery Central Bus Stand', city: 'Kanyakumari (Nagercoil)', district: 'Kanyakumari', lat: 8.1833, lng: 77.4119, category: 'transit', popular: true },
  { id: 'kk_cape', name: 'Kanyakumari Thiruvalluvar Statue & Sunset Point', city: 'Kanyakumari (Nagercoil)', district: 'Kanyakumari', lat: 8.0780, lng: 77.5550, category: 'landmark', popular: true },
  { id: 'kk_marthandam', name: 'Marthandam Rubber & Honey Trading Market', city: 'Kanyakumari (Nagercoil)', district: 'Kanyakumari', lat: 8.3000, lng: 77.2200, category: 'commercial', popular: false }
];

// Backwards compatibility alias
export const VELLORE_LOCATIONS = TAMIL_NADU_LOCATIONS;

/**
 * Default Center: Chennai, Tamil Nadu
 */
export const TAMIL_NADU_DEFAULT_CENTER = {
  lat: 13.0827,
  lng: 80.2707,
  name: 'Chennai, Tamil Nadu'
};

export const VELLORE_DEFAULT_CENTER = TAMIL_NADU_DEFAULT_CENTER;

/**
 * Calculates Haversine Distance between two GPS coordinates in kilometers
 */
export function calculateHaversineDistance(
  lat1: any,
  lon1: any,
  lat2: any,
  lon2: any
): number {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return 0.5;
  }

  if (nLat1 === nLat2 && nLon1 === nLon2) return 0;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(Math.max(0, Math.min(1, a))), Math.sqrt(Math.max(0, 1 - a)));
  const distance = R * c;
  
  return isNaN(distance) ? 0.5 : Math.round(distance * 100) / 100; // Rounded to 2 decimal places
}

/**
 * Formats distance nicely (e.g. "850 m" or "2.4 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Finds the closest Tamil Nadu City for a given coordinate
 */
export function getClosestTamilNaduCity(lat: number, lng: number): TamilNaduCity {
  let closest = TAMIL_NADU_CITIES[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.lat, closest.lng);

  for (const city of TAMIL_NADU_CITIES) {
    const dist = calculateHaversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}

/**
 * Finds the closest Tamil Nadu Landmark or Area name for a coordinate
 */
export function getClosestLandmark(lat: number, lng: number): string {
  if (!lat || !lng) return 'Tamil Nadu';

  let closest = TAMIL_NADU_LOCATIONS[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.lat, closest.lng);

  for (const loc of TAMIL_NADU_LOCATIONS) {
    const dist = calculateHaversineDistance(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  if (minDistance < 1.0) {
    return `${closest.name} (${closest.city})`;
  } else if (minDistance < 25.0) {
    return `${closest.city} (${formatDistance(minDistance)} from ${closest.name})`;
  }

  // If farther, resolve to closest major city
  const closestCity = getClosestTamilNaduCity(lat, lng);
  return `${closestCity.name} Region`;
}

/**
 * Browser Geolocation API Promise Helper with high accuracy
 */
export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  city: string;
}

export function requestBrowserLocation(): Promise<GpsLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    const tryGetPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const closestCity = getClosestTamilNaduCity(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            city: closestCity.name
          });
        },
        (err) => {
          if (highAccuracy) {
            // Auto-fallback to low accuracy and cached GPS position (crucial for offline/indoor satellite lock)
            tryGetPosition(false);
            return;
          }
          let msg = 'Unable to retrieve your location.';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg = 'Location permission was denied. Please allow location access or select your city manually.';
              break;
            case err.POSITION_UNAVAILABLE:
              msg = 'Location information is unavailable on this device. Please select your city manually.';
              break;
            case err.TIMEOUT:
              msg = 'Location request timed out. Please select your district manually from the list.';
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 6000 : 4000,
          maximumAge: 600000 // 10 minutes cache
        }
      );
    };

    tryGetPosition(true);
  });
}

/**
 * Retrieves landmarks filtered strictly by City or District name
 */
export function getLocationsByCity(cityName?: string): TamilNaduLocation[] {
  if (!cityName || cityName.toLowerCase() === 'all') {
    return TAMIL_NADU_LOCATIONS;
  }
  const query = cityName.toLowerCase().trim();
  
  // Exact match by city or district
  const matched = TAMIL_NADU_LOCATIONS.filter(l => 
    l.city.toLowerCase() === query ||
    l.district.toLowerCase() === query
  );
  if (matched.length > 0) {
    return matched;
  }

  // Partial match by city or district
  const partial = TAMIL_NADU_LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(query) ||
    query.includes(l.city.toLowerCase()) ||
    l.district.toLowerCase().includes(query) ||
    query.includes(l.district.toLowerCase())
  );
  if (partial.length > 0) {
    return partial;
  }

  // Find corresponding city object from TAMIL_NADU_CITIES
  const cityObj = TAMIL_NADU_CITIES.find(c => 
    c.name.toLowerCase() === query || c.district.toLowerCase() === query
  );
  if (cityObj) {
    const districtMatches = TAMIL_NADU_LOCATIONS.filter(l => 
      l.district.toLowerCase() === cityObj.district.toLowerCase()
    );
    if (districtMatches.length > 0) {
      return districtMatches;
    }
  }

  return TAMIL_NADU_LOCATIONS;
}

export type TravelMode = 'bike' | 'car' | 'auto' | 'walking';

export interface TravelEstimate {
  mode: TravelMode;
  label: string;
  durationMinutes: number;
  formattedDuration: string;
  speedKmph: number;
  icon: string;
}

export interface TravelEstimatesResult {
  distanceKm: number;
  formattedDistance: string;
  estimates: Record<TravelMode, TravelEstimate>;
}

/**
 * Calculates compass bearing from point 1 to point 2 in degrees (0 - 360)
 */
export function calculateBearing(lat1: any, lon1: any, lat2: any, lon2: any): number {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2) || (nLat1 === nLat2 && nLon1 === nLon2)) {
    return 0;
  }

  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const lat1Rad = (nLat1 * Math.PI) / 180;
  const lat2Rad = (nLat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  if (isNaN(bearing)) return 0;
  return ((bearing % 360) + 360) % 360;
}

/**
 * Converts degree bearing into readable 8-cardinal direction
 */
export function getCompassDirection(bearing: any): { code: string; label: string } {
  const defaultDir = { code: 'N', label: 'North' };
  const nBearing = Number(bearing);
  if (isNaN(nBearing)) return defaultDir;

  const directions = [
    { code: 'N', label: 'North' },
    { code: 'NE', label: 'North-East' },
    { code: 'E', label: 'East' },
    { code: 'SE', label: 'South-East' },
    { code: 'S', label: 'South' },
    { code: 'SW', label: 'South-West' },
    { code: 'W', label: 'West' },
    { code: 'NW', label: 'North-West' }
  ];
  const normalized = ((nBearing % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index] || defaultDir;
}

/**
 * Calculates realistic travel duration for Indian urban / semi-urban traffic
 */
export function getTravelEstimates(distanceKm: any): TravelEstimatesResult {
  const safeKm = typeof distanceKm === 'number' && !isNaN(distanceKm) && distanceKm >= 0 ? distanceKm : 0.5;
  // Road factor to account for actual road networks vs straight line (approx 1.3x)
  const roadDistanceKm = Math.max(0.2, safeKm * 1.3);

  const formatMins = (mins: number) => {
    if (mins < 1) return '< 1 min';
    if (mins < 60) return `${Math.round(mins)} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = Math.round(mins % 60);
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  // Realistic city speeds in Tamil Nadu / India (km/h)
  const speeds = {
    bike: 30,    // Two-wheeler (navigates traffic fastest)
    car: 22,     // Four-wheeler (subject to traffic slowdowns)
    auto: 20,    // Auto-rickshaw / Transit
    walking: 4.5 // Pedestrian walk
  };

  const bikeMins = Math.max(1, (roadDistanceKm / speeds.bike) * 60);
  const carMins = Math.max(2, (roadDistanceKm / speeds.car) * 60);
  const autoMins = Math.max(2, (roadDistanceKm / speeds.auto) * 60);
  const walkMins = Math.max(1, (roadDistanceKm / speeds.walking) * 60);

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    formattedDistance: formatDistance(distanceKm),
    estimates: {
      bike: {
        mode: 'bike',
        label: 'Two-Wheeler / Bike',
        durationMinutes: Math.round(bikeMins),
        formattedDuration: formatMins(bikeMins),
        speedKmph: speeds.bike,
        icon: '🏍️'
      },
      car: {
        mode: 'car',
        label: 'Car / Taxi',
        durationMinutes: Math.round(carMins),
        formattedDuration: formatMins(carMins),
        speedKmph: speeds.car,
        icon: '🚗'
      },
      auto: {
        mode: 'auto',
        label: 'Auto / Transit',
        durationMinutes: Math.round(autoMins),
        formattedDuration: formatMins(autoMins),
        speedKmph: speeds.auto,
        icon: '🛺'
      },
      walking: {
        mode: 'walking',
        label: 'Walking',
        durationMinutes: Math.round(walkMins),
        formattedDuration: formatMins(walkMins),
        speedKmph: speeds.walking,
        icon: '🚶'
      }
    }
  };
}

/**
 * Builds high-accuracy multi-provider navigation URLs.
 * If recruiter's address or place string is provided, passes the address so Google Maps accurately identifies the exact recruiter workplace/address.
 */
export function buildNavigationUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: TravelMode = 'bike',
  provider: 'google' | 'apple' | 'waze' | 'geo' = 'google',
  destAddress?: string,
  originAddress?: string
): string {
  const gMode = mode === 'walking' ? 'walking' : mode === 'bike' ? 'two_wheeler' : 'driving';

  // Build destination query string:
  // If destination address is available, format destination query with address for pinpoint resolution
  const destQuery = destAddress && destAddress.trim().length > 3
    ? encodeURIComponent(destAddress.trim())
    : `${destLat},${destLng}`;

  const originQuery = originAddress && originAddress.trim().length > 3
    ? encodeURIComponent(originAddress.trim())
    : `${originLat},${originLng}`;

  switch (provider) {
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destQuery}&travelmode=${gMode}`;
    case 'apple':
      return `https://maps.apple.com/?saddr=${originQuery}&daddr=${destQuery}&dirflg=${mode === 'walking' ? 'w' : 'd'}`;
    case 'waze':
      return `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes&from=${originLat},${originLng}`;
    case 'geo':
      return `geo:${destLat},${destLng}?q=${destQuery}`;
    default:
      return `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destQuery}`;
  }
}

/**
 * Generates interpolated route waypoints for smooth map rendering
 */
export function generateRoutePoints(
  lat1: any,
  lon1: any,
  lat2: any,
  lon2: any,
  steps: number = 6
): [number, number][] {
  const nLat1 = Number(lat1) || 12.9165;
  const nLon1 = Number(lon1) || 79.1325;
  const nLat2 = Number(lat2) || nLat1;
  const nLon2 = Number(lon2) || nLon1;

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Slight curve offset to give natural road look on map
    const lateralOffset = Math.sin(fraction * Math.PI) * 0.0008;
    const lat = nLat1 + (nLat2 - nLat1) * fraction + lateralOffset;
    const lon = nLon1 + (nLon2 - nLon1) * fraction - lateralOffset * 0.5;
    points.push([Number(lat.toFixed(6)), Number(lon.toFixed(6))]);
  }
  return points;
}

