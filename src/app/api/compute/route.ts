import { elysiaClient } from "@/api/elysiaClient";
import { getLatLongFromZip } from "@/api/extra/getLatLongFromZip";
import { InsertQuoteGroup, InsertQuoteSingle, QuoteGroup } from "@/db/schema";
import { createQuoteGroup } from "@/db/queries";
import { db } from "@/db/db";
export async function GET(request: Request) {
  //Delete and return
  // await db.delete(QuoteGroup);
  // return Response.json({ message: "Deleted" });
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
    zipCode
  );

  return Response.json({ ...data });
}

const DEFAULT_INSTALLER_FEES = 0.2;
const getInstallerFee = (): number => {
  const installerFee = process.env.INSTALLER_FEE;
  if (!installerFee) return DEFAULT_INSTALLER_FEES;
  const float = parseFloat(installerFee);
  if (isNaN(float)) return DEFAULT_INSTALLER_FEES;
  return float;
};
const targetTimestamp = 1718028000;
const formulaConstants = {
  maximumElectricityPrice: 0.35,
  protocolFeeValueMultiplier: 1.5,
  startingDateTimestamp: targetTimestamp,
  targetTimestamp: targetTimestamp + 86400 * 7 * 4, //it's starting date + 4 weeks
  decayPerDay: 0.0055, //.55%,
  installerFee: getInstallerFee(),
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
  console.log(`installer fee is ${args.installerFee}`);
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
  zipCode: string
) {
  const { lat, lon: long } = await getLatLongFromZip(zipCode);
  // const res = await elysiaClient.protocolFees.estimateFees.get({
  //   $query: {
  //     electricityPricePerKWH: (electricityPriceKWH * 1000).toFixed(4),
  //     latitude: lat.toFixed(4),
  //     longitude: long.toFixed(4),
  //     powerOutputMWH: (powerOutputKWH * 1000).toFixed(4),
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

  const group: InsertQuoteGroup = {
    electricityPrice: electricityPriceKWH.toFixed(4),
    powerOutput: powerOutputKWH.toFixed(4),
    systemSize: systemSizeKW.toFixed(4),
    zipCode: zipCode,
    maximumElectricityPrice:
      formulaConstants.maximumElectricityPrice.toFixed(4),
    protocolFeeValueMultiplier:
      formulaConstants.protocolFeeValueMultiplier.toFixed(4),
    startingDateTimestamp: formulaConstants.startingDateTimestamp.toFixed(4),
    targetTimestamp: formulaConstants.targetTimestamp.toFixed(4),
    decayPerDay: formulaConstants.decayPerDay.toFixed(4),
    installerFee: formulaConstants.installerFee.toFixed(4),
    lat: lat.toFixed(4),
    lon: long.toFixed(4),
    carbonCreditEffectiveness: carbonCreditEffectiveness.toFixed(4),
  };
  const quoteGroup: InsertQuoteSingle[] = otherEstimates.map((estimate) => ({
    quote: estimate.estimate.toFixed(4),
    timestampToBenchmark: estimate.timestamp.toFixed(4),
  }));

  //Insert it
  const { quoteGroupId } = await createQuoteGroup({
    quotes: quoteGroup,
    group,
  });

  // const quoteGroupId = 10;

  //Filter other estimates to only include benchmarks >= current day
  const currentDay = Math.floor(new Date().getTime() / 1000 / 86400);
  const filteredOtherEstimates = otherEstimates.filter(
    (estimate) => estimate.timestamp / 86400 >= currentDay
  );

  return {
    estimates: filteredOtherEstimates,
    quoteGroupId,
  };
}
