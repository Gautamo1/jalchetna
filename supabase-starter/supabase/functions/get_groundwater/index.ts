// VERSION WITH INLINED JSON (for Dashboard deployment without file imports)
// ARCHITECTURE: Processes ONE state per invocation, auto-rotates through all states
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import dayjs from "https://esm.sh/dayjs@1.11.10";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const API_URL = "https://indiawris.gov.in/Dataset/Ground Water Level";
const AGENCY = "CGWB";
const DAYS = 7;

// Inlined state-district mapping
const json: Record<string, string[]> = {
  "Andhra Pradesh": ["Alluri Sitharama Raju", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor", "East Godavari", "Eluru", "Guntur", "Krishna", "Kurnool", "Nandyal", "Nellore", "Palnadu", "Prakasam", "Srikakulam", "Sri Sathya Sai", "Visakhapatnam", "Vizianagaram", "West Godavari"],
  "Arunachal Pradesh": ["Changlang", "East Siang", "Lohit", "Lower Dibang Valley", "Lower Subansiri", "Namsai", "Papum Pare", "Tirap"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Nagaon", "Nalbari", "Sonitpur", "Tinsukia", "Udalguri"],
  "Bihar": ["Araria", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali"],
  "Chhattisgarh": ["Balod", "Bastar", "Bemetara", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Mahasamund", "Mungeli", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Chhota Udaipur", "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Morbi", "Narmada", "Navsari", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kullu", "Mandi", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Latehar", "Lohardaga", "Pakur", "Ramgarh", "Ranchi"],
  "Karnataka": ["Ballari", "Bangalore Rural", "Bangalore Urban", "Bidar", "Chitradurga", "Davanagere", "Dharwad", "Kalaburagi", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Udupi", "Uttara Kannada", "Bijapur", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Chandrapur", "Osmanabad", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nanded", "Nandurbar", "Nagpur", "Nashik", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi", "West Garo Hills", "West Khasi Hills"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Mon", "Phek", "Tuensang", "Wokha"],
  "Odisha": ["Bhadrak", "Balangir", "Bargarh", "Cuttack", "Debagarh", "Dhenkanal", "Ganjam", "Gajapati", "Jharsuguda", "Khordha", "Kendujhar", "Kalahandi", "Kandhamal", "Koraput", "Kendrapara", "Malkangiri", "Mayurbhanj", "Nuapada", "Nayagarh", "Puri", "Rayagada", "Sambalpur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Pathankot", "Patiala", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Nilgiris", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Tenkasi", "Tiruppur", "Tiruchirappalli", "Theni", "Tirunelveli", "Thanjavur", "Thoothukudi", "Tiruvallur", "Tiruvarur", "Tiruvannamalai", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Hanamkonda", "Hyderabad", "Jangaon", "Kamareddy", "Karimnagar", "Khammam", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nalgonda", "Nagarkurnool", "Narayanpet", "Nirmal", "Nizamabad", "Rajanna Sircilla", "Ranga Reddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy"],
  "Tripura": ["Dhalai", "Gomati", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Auraiya", "Ayodhya", "Azamgarh", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Firozabad", "Ghaziabad", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kaushambi", "Kannauj", "Kanpur Dehat", "Kheri", "Lalitpur", "Lucknow", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rampur", "Saharanpur", "Sambhal", "Shamli", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kolkata", "Murshidabad", "Nadia", "North 24 Parganas", "South 24 Parganas", "South Dinajpur"],
  "Delhi": ["New Delhi", "South East Delhi"],
  "Puducherry": ["Karaikal", "Puducherry", "Yanam"]
};

interface GroundwaterRecord {
  stationName: string;
  stationCode: string;
  dataTime: string;
  dataValue: number;
  latitude?: number;
  longitude?: number;
  stationType?: string;
  majorBasin?: string;
  tributary?: string;
  dataAcquisitionMode?: string;
  stationStatus?: string;
  tehsil?: string;
  datatypeCode?: string;
  description?: string;
  unit?: string;
  block?: string;
  village?: string;
  wellType?: string;
}

interface APIResponse {
  data?: GroundwaterRecord[];
}

Deno.serve(async (req: Request) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");
    const startdate = dayjs().subtract(DAYS, "day").format("YYYY-MM-DD");
    const enddate = today;

    // Build flat list of all state-district pairs
    const allPairs: Array<{state: string, district: string}> = [];
    for (const [state, districts] of Object.entries(json)) {
      for (const district of districts) {
        allPairs.push({ state, district });
      }
    }

    // Get or initialize tracker
    const { data: tracker, error: trackerError } = await supabase
      .from("groundwater_state_tracker")
      .select("last_state_index")
      .eq("id", 1)
      .single();

    if (trackerError && trackerError.code !== 'PGRST116') {
      throw new Error(`Tracker error: ${trackerError.message}`);
    }

    const lastIndex = tracker?.last_state_index ?? -1;
    const currentIndex = (lastIndex + 1) % allPairs.length;
    const { state, district } = allPairs[currentIndex];

    console.log(`Processing ${currentIndex + 1}/${allPairs.length}: ${state} - ${district}`);

    let totalRecordsInserted = 0;
    let page = 0;

    // Process this ONE district only
    while (true) {
      const params = new URLSearchParams({
        stateName: state,
        districtName: district,
        agencyName: AGENCY,
        startdate,
        enddate,
        download: "false",
        page: page.toString(),
        size: "500"
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      let res;
      let retries = 0;
      const maxRetries = 1;
      
      while (retries <= maxRetries) {
        try {
          res = await fetch(`${API_URL}?${params.toString()}`, {
            method: "POST",
            headers: { "accept": "application/json" },
            body: "",
            signal: controller.signal,
          });
          break; // Success, exit retry loop
        } catch (err) {
          retries++;
          if (retries > maxRetries) {
            clearTimeout(timeoutId);
            if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('timeout') || err.message.includes('ETIMEDOUT'))) {
              console.warn(`Timeout/connection error for ${state} - ${district}, page ${page}. Skipping...`);
              break;
            }
            throw err;
          }
          console.warn(`Retry ${retries}/${maxRetries} for ${state} - ${district}, page ${page}...`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      clearTimeout(timeoutId);
        
        if (!res) break; // No response after retries, skip to next district

        if (!res.ok) {
          console.warn(`API returned ${res.status} for ${state} - ${district}, page ${page}`);
          break;
        }

        const data: APIResponse = await res.json();
        const records = data?.data || [];
        if (records.length === 0) break;

        const latestDate = records
          .map(r => r.dataTime)
          .filter(Boolean)
          .sort()
          .pop();

        const latestRows = records.filter(r => r.dataTime === latestDate);

        const toInsert = latestRows.map(row => ({
          state,
          district,
          station_name: row.stationName,
          station_code: row.stationCode,
          measurement_date: row.dataTime.split('T')[0],
          water_level: row.dataValue,
          agency: AGENCY,
          latitude: row.latitude,
          longitude: row.longitude,
          station_type: row.stationType,
          major_basin: row.majorBasin,
          tributary: row.tributary,
          data_acquisition_mode: row.dataAcquisitionMode,
          station_status: row.stationStatus,
          tehsil: row.tehsil,
          datatype_code: row.datatypeCode,
          description: row.description,
          unit: row.unit,
          block: row.block,
          village: row.village,
          well_type: row.wellType
        }));

        const { error } = await supabase
          .from("groundwater_levels")
          .upsert(toInsert, {
            onConflict: "station_code,measurement_date"
          });

        if (error) {
          console.error(`Error inserting data for ${state} - ${district}:`, error);
        } else {
          totalRecordsInserted += toInsert.length;
          console.log(`Successfully inserted ${toInsert.length} records`);
        }

        page += 1;
        await new Promise(r => setTimeout(r, 1000));
      }

    // ONLY update tracker if we actually inserted data
    if (totalRecordsInserted > 0) {
      const { error: updateError } = await supabase
        .from("groundwater_state_tracker")
        .upsert({ id: 1, last_state_index: currentIndex, last_run: today }, {
          onConflict: "id"
        });
      
      if (updateError) {
        console.error("Error updating tracker:", updateError);
      } else {
        console.log(`Tracker updated to index ${currentIndex}`);
      }
    } else {
      console.warn(`No data inserted for ${state} - ${district}. Tracker NOT updated. Retrying same district on next run.`);
    }

    return new Response(JSON.stringify({ 
      message: "Done", 
      state,
      district,
      index: `${currentIndex + 1}/${allPairs.length}`,
      recordsInserted: totalRecordsInserted,
      trackerUpdated: totalRecordsInserted > 0,
      timestamp: today 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in get_groundwater function:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
