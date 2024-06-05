"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useForm, Resolver } from "react-hook-form";
import { checkIfNumber } from "@/lib/check-if-number";

const Loader = () => {
  return (
    <div className="w-8 h-8 border-2 border-t-0 border-black rounded-full animate-spin"></div>
  );
};

type FormState = {
  electricityPrice: number;
  zipCode: string;
  systemOutput: number;
};

type SingleState = {
  title: string;
  description: string;
  placeholder: string;
  value: string | number | null;
  inputType: "number" | "text";
};
type StateKey = "electricityPrice" | "zipCode" | "systemSize" | "systemOutput";
type State = Record<StateKey, SingleState>;
const View = () => {
  const resolver: Resolver<FormState> = async (values) => {
    return {
      values: values,
      errors: {},
    };
  };
  const { register, handleSubmit, formState, getValues, setValue } =
    useForm<FormState>({
      resolver,
    });

  // const latLongMutation = useMutation({
  //   mutationFn: getLatLongFromZip,
  //   mutationKey: ["latLong"],
  // });

  async function getEstimateFarmValue(
    electricityPrice: number,
    systemOutput: number,
    systemSize: number,
    zipCode: string
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
      value: 0.13,
      inputType: "number",
    },
    zipCode: {
      title: "Zip Code",
      description: "This is the zip code of the location",
      placeholder: "90210",
      value: "75173",
      inputType: "text",
    },
    systemSize: {
      title: "System Size (kW)",
      description: "This is the size of the solar system in kW",
      placeholder: "5",
      value: 44.24,
      inputType: "number",
    },
    systemOutput: {
      title: "System Output (kWh)",
      description: "This is the output of the solar system in kWh per year",
      placeholder: "500",
      value: 80058,
      inputType: "number",
    },
  };

  const textToShowForResult = (result: number, date: Date) => {
    if (result <= 0) {
      return `${date.toLocaleDateString()} $0.00`;
    }
    return `${date.toLocaleDateString()}: $${Number(result.toFixed(2)).toLocaleString()}`;
  };

  const estimateMutationFN = async () => {
    const electricityPriceForm =
      getValues("electricityPrice") || initialState.electricityPrice.value;
    const systemOutputForm =
      getValues("systemOutput") || initialState.systemOutput.value;
    const zipCodeForm =
      getValues("zipCode") || (initialState.zipCode.value as string);

    console.log({ electricityPriceForm, systemOutputForm, zipCodeForm });
    const systemSize = initialState.systemSize.value;
    return await getEstimateFarmValue(
      electricityPriceForm as number,
      systemOutputForm as number,
      systemSize as number,
      zipCodeForm
    );
  };
  const estimateMutation = useMutation({
    mutationFn: () => estimateMutationFN(),
    mutationKey: ["estimate"],
  });

  function renderInputValue(val: string | number | null) {
    //if number, return number
    if (typeof val === "number") return val;
    if (val === null) return "";
    return val;
  }
  return (
    <>
      <div className="flex flex-col  justify-center gap-y-4">
        <div>
          <Label className="text-sm">Electricity Price ($Per kWh)</Label>
          <p>
            <small>{initialState.electricityPrice.description}</small>
          </p>
          <Input
            defaultValue={initialState.electricityPrice.value as number}
            onKeyDown={checkIfNumber}
            type="number"
            className="w-full"
            {...register("electricityPrice", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label className="text-sm">Zip Code</Label>
          <p>
            <small>{initialState.zipCode.description}</small>
          </p>
          <Input
            type="text"
            defaultValue={initialState.zipCode.value as string}
            className="w-full"
            {...register("zipCode")}
          />
        </div>

        <div>
          <Label className="text-sm">System Output (kWh)</Label>
          <p>
            <small>{initialState.systemOutput.description}</small>
          </p>
          <Input
            defaultValue={initialState.systemOutput.value as number}
            onKeyDown={checkIfNumber}
            type="number"
            className="w-full"
            {...register("systemOutput", { valueAsNumber: true })}
          />
        </div>
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

        {/**If the length is 0, have a message to contact admin */}
        {estimateMutation.data?.estimates.length === 0 && (
          <p className={`border p-2 text-sm rounded-md mt-1`}>
            Please contact the admin to reset the estimates
          </p>
        )}
        <div>
          {estimateMutation.data?.estimates.map((estimate, index) => {
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
          })}
        </div>
      </div>
    </>
  );
};

export default View;

/* {stateKeys.map((key) => {
          //Don't loop over systemSize
          if (key === "systemSize") return null;
          const input = state[key as keyof State];
          return (
            <div key={key}>
              <Label>{input.title}</Label>
              <p>
                <small>{input.description}</small>
              </p>
              <Input
                type={input.inputType}
                className="w-full "
                // placeholder={input.placeholder}
                size={40}
                value={renderInputValue(input.value)}
                onChange={(e) =>
                //   handleChangeKey(key as keyof State, e.target.value)
                }
              />
            </div>
          );
        })}*/
