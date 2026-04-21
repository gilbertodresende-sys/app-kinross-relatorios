import WEATHER_CODES from '../constants/wheatherCodes';

export async function fetchWeatherByCityAndDate(cidade, data) {
  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}` +
    `&count=10&language=pt&countryCode=BR&format=json`;

  console.log('Geo URL:', geoUrl);

  const geoResponse = await fetch(geoUrl);
  console.log('Geo status:', geoResponse.status, geoResponse.statusText);

  if (!geoResponse.ok) {
    const geoText = await geoResponse.text();
    console.log('Geo error body:', geoText);
    throw new Error(`GEOCODING_HTTP_${geoResponse.status}`);
  }

  const geoJson = await geoResponse.json();
  console.log('Geocoding response:', geoJson);

  if (!geoJson?.results?.length) {
    throw new Error('CITY_NOT_FOUND');
  }

  const local = geoJson.results[0];

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}` +
    `&longitude=${local.longitude}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=America%2FSao_Paulo` +
    `&start_date=${data}` +
    `&end_date=${data}`;

  console.log('Weather URL:', weatherUrl);

  const weatherResponse = await fetch(weatherUrl);
  console.log('Weather status:', weatherResponse.status, weatherResponse.statusText);

  if (!weatherResponse.ok) {
    const weatherText = await weatherResponse.text();
    console.log('Weather error body:', weatherText);
    throw new Error(`WEATHER_HTTP_${weatherResponse.status}`);
  }

  const weatherJson = await weatherResponse.json();
  console.log('Weather response:', weatherJson);

  const daily = weatherJson?.daily;

  if (!daily?.time?.length) {
    throw new Error('NO_DATA');
  }

  return {
    cidadeEncontrada: `${local.name}${local.admin1 ? ` - ${local.admin1}` : ''}`,
    pais: local.country,
    data: daily.time[0],
    temperaturaMax: daily.temperature_2m_max[0],
    temperaturaMin: daily.temperature_2m_min[0],
    chanceChuva: daily.precipitation_probability_max[0],
    ventoMax: daily.wind_speed_10m_max[0],
    codigoTempo: daily.weather_code[0],
    descricaoTempo:
      WEATHER_CODES[daily.weather_code[0]] || 'Condição não mapeada',
  };
}