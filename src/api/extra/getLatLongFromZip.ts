export const getLatLongFromZip = async (zip: string) => {
  const res = await fetch(
    `https://zip-lat-long-microservice-production.up.railway.app/get-lat-long-from-zip/${zip}`
  );
  const data = await res.json();
  return data as { lat: number; lon: number };
};
