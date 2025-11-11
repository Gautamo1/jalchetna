// Node.js scraper for groundwater data (runs on GitHub Actions)
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = "https://indiawris.gov.in/Dataset/Ground Water Level";
const AGENCY = "CGWB";
const DAYS = 7;

const stateDistricts = {
  "Andhra Pradesh": ["Alluri Sitharama Raju", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor", "East Godavari", "Eluru", "Guntur", "Krishna", "Kurnool", "Nandyal", "Nellore", "Palnadu", "Prakasam", "Srikakulam", "Sri Sathya Sai", "Visakhapatnam", "Vizianagaram", "West Godavari"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Pathankot", "Patiala", "Sangrur", "Tarn Taran"],
  // Add more states as needed
};

async function main() {
  const today = dayjs().format("YYYY-MM-DD");
  const startdate = dayjs().subtract(DAYS, "day").format("YYYY-MM-DD");
  const enddate = today;

  // Get tracker
  const { data: tracker } = await supabase
    .from("groundwater_state_tracker")
    .select("last_state_index")
    .eq("id", 1)
    .single();

  const allStates = Object.keys(stateDistricts);
  const lastIndex = tracker?.last_state_index ?? -1;
  const currentIndex = (lastIndex + 1) % allStates.length;
  const state = allStates[currentIndex];

  console.log(`Processing state ${currentIndex + 1}/${allStates.length}: ${state}`);

  const districts = stateDistricts[state];
  let totalRecordsInserted = 0;

  for (const district of districts) {
    let page = 0;

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

      try {
        const response = await fetch(`${API_URL}?${params.toString()}`, {
          method: "POST",
          headers: { "accept": "application/json" },
        });

        if (!response.ok) {
          console.warn(`API returned ${response.status} for ${state} - ${district}, page ${page}`);
          break;
        }

        const data = await response.json();
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
        }

        page += 1;
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error for ${state} - ${district}, page ${page}:`, err.message);
        break;
      }
    }
  }

  // Update tracker
  await supabase
    .from("groundwater_state_tracker")
    .upsert({ id: 1, last_state_index: currentIndex, last_run: today }, {
      onConflict: "id"
    });

  console.log(`Done! State: ${state}, Records inserted: ${totalRecordsInserted}`);
}

main().catch(console.error);
