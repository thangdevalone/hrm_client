import { TimeValue } from "react-aria";
import { TimeFieldStateOptions } from "react-stately";
import { TimeField } from "./time-field";
import React from "react";

const TimePicker = React.forwardRef<
  HTMLDivElement,
  Omit<TimeFieldStateOptions<TimeValue>, "locale">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>((props, forwardedRef) => {
  return <TimeField {...props} />;
});

TimePicker.displayName = "TimePicker";

export { TimePicker };
