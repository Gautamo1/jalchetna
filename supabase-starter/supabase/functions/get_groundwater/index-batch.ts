import json from "./state_districts.json" with { type: "json" };
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import dayjs from "https://esm.sh/dayjs@1.11.10";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const API_URL = "https://indiawris.gov.in/Dataset/Ground Water Level";
const AGENCY = "CGWB";
const DAYS = 7;

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

    const stateDistrictMap = json as Record<string, string[]>;

    for (const state of Object.keys(stateDistrictMap)) {
      for (const district of stateDistrictMap[state]) {
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

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          let res;
          try {
            res = await fetch(`${API_URL}?${params.toString()}`, {
              method: "POST",
              headers: { "accept": "application/json" },
              body: "",
              signal: controller.signal,
            });
          } catch (err) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.name === 'AbortError') {
              console.warn(`Timeout for ${state} - ${district}, page ${page}. Skipping...`);
              break;
            }
            throw err;
          }
          clearTimeout(timeoutId);

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
            measurement_date: row.dataTime.split('T')[0], // Extract date from datetime
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
          }

          page += 1;
          await new Promise(r => setTimeout(r, 350));
        }
      }
    }

    return new Response(JSON.stringify({ message: "Done", timestamp: today }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in get_groundwater function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
