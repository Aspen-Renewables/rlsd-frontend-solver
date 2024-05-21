"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { elysiaClient } from "@/api/elysiaClient";
import { getLatLongFromZip } from "@/api/extra/getLatLongFromZip";
import { useQueries } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

const Loader = () => {
  return (
    <div className="w-8 h-8 border-2 border-t-0 border-black rounded-full animate-spin"></div>
  );
};
const formulaConstants = {
  maximumElectricityPrice: 0.35,
  protocolFeeValueMultiplier: 1.5,
  startingDateTimestamp: 1716149330,
  targetTimestamp: 1716149330 + 86400 * 7 * 4, //it's starting date + 2 weeks
  decayPerDay: 0.006, //.6%
};

type EstimateCalculationArgs = {
  maximumElectricityPrice: number;
  electricityPrice: number;
  carbonCreditEffectiveness: number;
  protocolFeeValueMultiplier: number;
  effectiveSunHoursPerDay: number;
  systemSizeKW: number;
};
function runEstimateCalculation(args: EstimateCalculationArgs) {
  console.log(args);
  const c3 = args.maximumElectricityPrice;
  const c10 = args.carbonCreditEffectiveness;
  const c9 = args.electricityPrice;
  // const currentTimestamp = Math.floor(Date.now() / 1000);
  let currentTimestamp = new Date().getTime() / 1000;
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
  console.log("scale factor = ", scaleFactor);
  // let s = ()

  const a1 = c3 * c10 * scaleFactor - c9;

  const c4 = args.protocolFeeValueMultiplier;
  const c11 = args.effectiveSunHoursPerDay;
  const c12 = args.systemSizeKW;
  const answer = (a1 / c4) * c11 * 1000 * c12 * 2.44;
  return answer;
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
  const estimate = runEstimateCalculation({
    maximumElectricityPrice: formulaConstants.maximumElectricityPrice,
    electricityPrice: electricityPriceKWH,
    carbonCreditEffectiveness,
    protocolFeeValueMultiplier: formulaConstants.protocolFeeValueMultiplier,
    effectiveSunHoursPerDay: sunlightHours,
    systemSizeKW,
  });

  return {
    estimate,
  };
}
type SingleState = {
  title: string;
  description: string;
  placeholder: string;
  value: string | number | null;
};
type StateKey = "electricityPrice" | "zipCode" | "systemSize" | "systemOutput";
type State = Record<StateKey, SingleState>;
const View = () => {
  // const latLongMutation = useMutation({
  //   mutationFn: getLatLongFromZip,
  //   mutationKey: ["latLong"],
  // });

  const initialState: State = {
    electricityPrice: {
      title: "Electricity Price ($Per kWh)",
      description: "This is the price of electricity per kWh",
      placeholder: ".25",
      value: 0.1198,
    },
    zipCode: {
      title: "Zip Code",
      description: "This is the zip code of the location",
      placeholder: "90210",
      value: 75173,
    },
    systemSize: {
      title: "System Size (kW)",
      description: "This is the size of the solar system in kW",
      placeholder: "5",
      value: 44.24,
    },
    systemOutput: {
      title: "System Output (kWh)",
      description: "This is the output of the solar system in kWh per year",
      placeholder: "500",
      value: 80058,
    },
  };

  const stateKeys = Object.keys(initialState);
  const [state, setState] = useState<State>(initialState);

  const textToShowForResult = (result: number) => {
    if (result <= 0) {
      return `Farm is not profitable.`;
    }
    return `Estimated Farm Value: $${Number(result.toFixed(2)).toLocaleString()}`;
  };

  const estimateMutation = useMutation({
    mutationFn: () =>
      getEstimateFarmValue(
        state.electricityPrice.value as number,
        state.systemOutput.value as number,
        state.systemSize.value as number,
        state.zipCode.value as number
      ),
    mutationKey: ["estimate", JSON.stringify(state)],
  });

  function handleChangeKey(key: keyof State, value: string) {
    // setState((prev) => ({
    //   ...prev,
    //   [key]: {
    //     ...prev[key],
    //     value,
    //   },
    // }));
    //if the value is a number, convert it to a number
    //if not a number, set to null
    if (value === "") value = null as unknown as string;
    const newValue = isNaN(Number(value)) ? value : Number(value);
    setState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue,
      },
    }));
  }

  return (
    <>
      <div className="flex flex-col  justify-center gap-y-4">
        {stateKeys.map((key) => {
          const input = state[key as keyof State];
          return (
            <div key={key}>
              <Label>{input.title}</Label>
              <p>
                <small>{input.description}</small>
              </p>
              <Input
                type={"text"}
                className="w-full "
                // placeholder={input.placeholder}
                size={40}
                value={input.value || ""}
                onChange={(e) =>
                  handleChangeKey(key as keyof State, e.target.value)
                }
              />
            </div>
          );
        })}
        <Button
          onClick={() => {
            estimateMutation.mutate();
          }}
          className="w-full"
        >
          Calculate
        </Button>
        <div className="mx-auto">
          {estimateMutation.isPending && <Loader />}
        </div>
        <div>
          {estimateMutation.data?.estimate && (
            <div>
              <p>{textToShowForResult(estimateMutation.data.estimate)}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default View;
