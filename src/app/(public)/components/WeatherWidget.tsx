"use client";

import { useEffect, useState } from "react";
import { Wind, Droplets, Eye, MapPin, Thermometer } from "lucide-react";

interface WttrData {
  current_condition: Array<{
    temp_C: string;
    FeelsLikeC: string;
    humidity: string;
    weatherDesc: Array<{ value: string }>;
    visibility: string;
    windspeedKmph: string;
    weatherCode: string;
    uvIndex: string;
  }>;
  nearest_area: Array<{
    areaName: Array<{ value: string }>;
  }>;
  weather: Array<{
    maxtempC: string;
    mintempC: string;
    hourly: Array<{ chanceofrain: string }>;
  }>;
}

const WEATHER_ICONS: Record<string, string> = {
  "113": "☀️", "116": "⛅", "119": "☁️", "122": "☁️",
  "143": "🌫️", "176": "🌦️", "179": "🌨️", "182": "🌧️",
  "185": "🌧️", "200": "⛈️", "227": "🌨️", "230": "❄️",
  "248": "🌫️", "260": "🌫️", "263": "🌦️", "266": "🌧️",
  "281": "🌧️", "284": "🌧️", "293": "🌦️", "296": "🌧️",
  "299": "🌧️", "302": "🌧️", "305": "🌧️", "308": "🌧️",
  "311": "🌧️", "314": "🌧️", "317": "🌨️", "320": "🌨️",
  "323": "🌨️", "326": "🌨️", "329": "❄️", "332": "❄️",
  "335": "❄️", "338": "❄️", "350": "🌧️", "353": "🌦️",
  "356": "🌧️", "359": "🌧️", "362": "🌨️", "365": "🌨️",
  "368": "🌨️", "371": "❄️", "374": "🌨️", "377": "🌨️",
  "386": "⛈️", "389": "⛈️", "392": "⛈️", "395": "⛈️",
};

const HINDI_DESC: Record<string, string> = {
  "sunny": "धूप", "clear": "साफ़ मौसम", "partly cloudy": "आंशिक बादल",
  "cloudy": "बादल", "overcast": "흐린", "mist": "धुंध",
  "fog": "कोहरा", "freezing fog": "घना कोहरा",
  "patchy rain": "हल्की बारिश", "light rain": "हल्की बारिश",
  "moderate rain": "मध्यम बारिश", "heavy rain": "भारी बारिश",
  "thundery": "आंधी-तूफ़ान", "snow": "बर्फ़बारी",
  "blizzard": "बर्फ़ानी तूफ़ान", "light drizzle": "फुहार",
};

function toHindi(desc: string): string {
  const lower = desc.toLowerCase();
  for (const [key, val] of Object.entries(HINDI_DESC)) {
    if (lower.includes(key)) return val;
  }
  return desc;
}

const AQI_LABELS = ["अच्छा", "संतोषजनक", "मध्यम", "खराब", "बहुत खराब", "खतरनाक"];
const AQI_COLORS = ["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-500", "bg-purple-600", "bg-rose-900"];

export default function WeatherWidget({ city = "Noida" }: { city?: string }) {
  const [data, setData] = useState<WttrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aqiLevel] = useState(4); // Simulated AQI (0-5 index)

  useEffect(() => {
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
        <div className="h-10 bg-slate-100 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full" />
      </div>
    );
  }

  if (!data) return null;

  const cc = data.current_condition[0];
  const area = data.nearest_area[0]?.areaName[0]?.value || city;
  const today = data.weather[0];
  const rain = today?.hourly?.[0]?.chanceofrain || "0";
  const icon = WEATHER_ICONS[cc.weatherCode] || "🌤️";
  const descHindi = toHindi(cc.weatherDesc[0]?.value || "");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* City Header */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
        <MapPin size={13} className="text-slate-500 shrink-0" />
        <span className="text-sm font-bold text-slate-700">{area}</span>
      </div>

      {/* Main Temperature Row */}
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-4xl">{icon}</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900">{cc.temp_C}°</span>
          </div>
          <p className="text-sm font-semibold text-slate-600">{descHindi}</p>
        </div>
        <div className="ml-auto text-right text-xs text-slate-500 space-y-0.5">
          <div className="flex items-center gap-1 justify-end">
            <Thermometer size={11} className="text-slate-400" />
            <span>महसूस {cc.FeelsLikeC}°</span>
          </div>
          <div>↑ {today?.maxtempC}° ↓ {today?.mintempC}°</div>
          <div className="flex items-center gap-1 justify-end">
            <Droplets size={11} className="text-blue-400" />
            <span>{rain}%</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-0 border-t border-slate-100 text-center">
        <div className="py-2 px-1 border-r border-slate-100">
          <Wind size={12} className="mx-auto text-slate-400 mb-0.5" />
          <p className="text-[11px] font-bold text-slate-700">{cc.windspeedKmph} km/h</p>
          <p className="text-[10px] text-slate-400">हवा</p>
        </div>
        <div className="py-2 px-1 border-r border-slate-100">
          <Droplets size={12} className="mx-auto text-slate-400 mb-0.5" />
          <p className="text-[11px] font-bold text-slate-700">{cc.humidity}%</p>
          <p className="text-[10px] text-slate-400">नमी</p>
        </div>
        <div className="py-2 px-1">
          <Eye size={12} className="mx-auto text-slate-400 mb-0.5" />
          <p className="text-[11px] font-bold text-slate-700">{cc.visibility} km</p>
          <p className="text-[10px] text-slate-400">दृश्यता</p>
        </div>
      </div>

      {/* AQI Bar */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-600">वायु की गुणवत्ता</span>
          <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${AQI_COLORS[aqiLevel]}`}>
            {AQI_LABELS[aqiLevel]}
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {AQI_COLORS.map((c, i) => (
            <div key={i} className={`flex-1 rounded-sm ${c} ${i > aqiLevel ? "opacity-20" : ""}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-slate-400">
          <span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
        </div>
      </div>

      <div className="px-4 py-1.5 text-[10px] text-slate-400 text-right">
        Powered by wttr.in
      </div>
    </div>
  );
}
