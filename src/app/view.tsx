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

  async function getEstimateFarmValue(
    electricityPrice: number,
    systemOutput: number,
    systemSize: number,
    zipCode: number
  ) {
    const res = await fetch(
      `/api/compute?electricityPrice=${electricityPrice}&powerOutput=${systemOutput}&systemSize=${systemSize}&zipCode=${zipCode}`
    );
    const data = (await res.json()) as {
      estimates: { estimate: number; timestamp: number }[];
    };
    return data;
  }
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

  const textToShowForResult = (result: number, date: Date) => {
    if (result <= 0) {
      return `${date.toLocaleDateString()} $0.00`;
    }
    return `${date.toLocaleDateString()}: $${Number(result.toFixed(2)).toLocaleString()}`;
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
        {estimateMutation.data?.estimates && <p>Estimated Payment</p>}
        <div>
          {estimateMutation.data?.estimates.map(
            (estimate, index) => {
              return (
                <div
                  className={`border p-2  text-sm rounded-md ${index !== 0 ? "mt-1" : ""}`}
                  key={estimate.timestamp}
                >
                  <p>
                    {textToShowForResult(
                      estimate.estimate,
                      new Date(estimate.timestamp * 1000)
                    )}
                  </p>
                </div>
              );
            }
            // <div>
            //   <p>{textToShowForResult(estimateMutation.data.estimate)}</p>
            // </div>
          )}
        </div>
      </div>
    </>
  );
};

export default View;
