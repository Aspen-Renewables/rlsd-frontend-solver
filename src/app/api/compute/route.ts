import { elysiaClient } from "@/api/elysiaClient";
import { getLatLongFromZip } from "@/api/extra/getLatLongFromZip";
import { createQuoteGroup, InsertQuoteSingle } from "@/db/schema";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const electricityPrice = searchParams.get("electricityPrice");
  const powerOutput = searchParams.get("powerOutput");
  const systemSize = searchParams.get("systemSize");
  const zipCode = searchParams.get("zipCode");

  if (!electricityPrice) throw new Error("electricityPrice is required");
  if (!powerOutput) throw new Error("powerOutput is required");
  if (!systemSize) throw new Error("systemSize is required");
  if (!zipCode) throw new Error("zipCode is required");

  const data = await getEstimateFarmValue(
    parseFloat(electricityPrice),
    parseFloat(powerOutput),
    parseFloat(systemSize),
    parseInt(zipCode)
  );

  return Response.json({ ...data });
}

const formulaConstants = {
  maximumElectricityPrice: 0.32,
  protocolFeeValueMultiplier: 1.5,
  startingDateTimestamp: 1716149330,
  targetTimestamp: 1716149330 + 86400 * 7 * 4, //it's starting date + 4 weeks
  decayPerDay: 0.0055, //.55%,
  installerFee: 0.2,
};

type EstimateCalculationArgs = {
  maximumElectricityPrice: number;
  electricityPrice: number;
  carbonCreditEffectiveness: number;
  protocolFeeValueMultiplier: number;
  effectiveSunHoursPerDay: number;
  systemSizeKW: number;
  timestampToBenchmark: number;
  installerFee: number;
};
function runEstimateCalculation(args: EstimateCalculationArgs) {
  const c3 = args.maximumElectricityPrice;
  const c10 = args.carbonCreditEffectiveness;
  const c9 = args.electricityPrice;
  // const currentTimestamp = Math.floor(Date.now() / 1000);
  let currentTimestamp = args.timestampToBenchmark;
  const modOverflowTwoWeeks = Math.floor(
    (currentTimestamp - formulaConstants.startingDateTimestamp) /
      (86400 * 7 * 2)
  );
  currentTimestamp =
    formulaConstants.startingDateTimestamp +
    modOverflowTwoWeeks * 86400 * 7 * 2;
  const timeDifferenceInDays = Math.floor(
    (currentTimestamp - formulaConstants.targetTimestamp) / 86400
  );
  const scaleFactor =
    (1 - formulaConstants.decayPerDay) ** timeDifferenceInDays;
  // let s = ()

  const a1 = c3 * c10 * scaleFactor - c9;

  const c4 = args.protocolFeeValueMultiplier;
  const c11 = args.effectiveSunHoursPerDay;
  const c12 = args.systemSizeKW;
  const answer = (a1 / c4) * c11 * 1000 * c12 * 2.44;
  return answer * (1 - args.installerFee);
}

async function getEstimateFarmValue(
  electricityPriceKWH: number,
  powerOutputKWH: number,
  systemSizeKW: number,
  zipCode: number
) {
  const { lat, lon: long } = await getLatLongFromZip(zipCode);
  // const res = await elysiaClient.protocolFees.estimateFees.get({
  //   $query: {
  //     electricityPricePerKWH: (electricityPriceKWH * 1000).toString(),
  //     latitude: lat.toString(),
  //     longitude: long.toString(),
  //     powerOutputMWH: (powerOutputKWH * 1000).toString(),
  //   },
  // });
  const res = await elysiaClient.protocolFees.sunlightAndCertificates.get({
    $query: {
      latitude: lat.toString(),
      longitude: long.toString(),
    },
  });

  if (!res.data) throw new Error("No data found");
  const sunlightHours = powerOutputKWH / 365.25 / systemSizeKW;

  const carbonCreditEffectiveness = res.data?.average_carbon_certificates;
  const firstTimestamp = new Date().getTime() / 1000;
  const estimateCurrentWeek = {
    timestamp: formulaConstants.startingDateTimestamp,
    estimate: runEstimateCalculation({
      maximumElectricityPrice: formulaConstants.maximumElectricityPrice,
      electricityPrice: electricityPriceKWH,
      carbonCreditEffectiveness,
      protocolFeeValueMultiplier: formulaConstants.protocolFeeValueMultiplier,
      effectiveSunHoursPerDay: sunlightHours,
      systemSizeKW,
      timestampToBenchmark: firstTimestamp,
      installerFee: formulaConstants.installerFee,
    }),
  };

  let otherEstimates: { timestamp: number; estimate: number }[] = [
    estimateCurrentWeek,
  ];
  let counter = 1;
  while (true) {
    const nextWeekEstimate = runEstimateCalculation({
      maximumElectricityPrice: formulaConstants.maximumElectricityPrice,
      electricityPrice: electricityPriceKWH,
      carbonCreditEffectiveness,
      protocolFeeValueMultiplier: formulaConstants.protocolFeeValueMultiplier,
      effectiveSunHoursPerDay: sunlightHours,
      systemSizeKW,
      timestampToBenchmark: firstTimestamp + 86400 * 7 * 2 * counter,
      installerFee: formulaConstants.installerFee,
    });

    otherEstimates.push({
      timestamp: firstTimestamp + 86400 * 7 * 2 * counter,
      estimate: Math.max(0, nextWeekEstimate),
    });
    if (nextWeekEstimate <= 0) break;
    counter++;
  }

  const quoteGroup: InsertQuoteSingle[] = otherEstimates.map((estimate) => ({
    electricityPrice: electricityPriceKWH.toString(),
    powerOutput: powerOutputKWH.toString(),
    systemSize: systemSizeKW.toString(),
    zipCode: zipCode.toString(),
    maximumElectricityPrice:
      formulaConstants.maximumElectricityPrice.toString(),
    protocolFeeValueMultiplier:
      formulaConstants.protocolFeeValueMultiplier.toString(),
    startingDateTimestamp: formulaConstants.startingDateTimestamp.toString(),
    targetTimestamp: formulaConstants.targetTimestamp.toString(),
    decayPerDay: formulaConstants.decayPerDay.toString(),
    installerFee: formulaConstants.installerFee.toString(),
    lat: lat.toString(),
    lon: long.toString(),
    carbonCreditEffectiveness: carbonCreditEffectiveness.toString(),
    quote: estimate.estimate.toString(),
    timestampToBenchmark: estimate.timestamp.toString(),
  }));

  //Insert it
  await createQuoteGroup({ quotes: quoteGroup });

  return {
    estimates: otherEstimates,
  };
}
