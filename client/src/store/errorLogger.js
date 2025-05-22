import { isRejectedWithValue } from "@reduxjs/toolkit";
import { addError } from "./errorsSlice";

export const errorLogger =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action)) {
      dispatch(addError(action.payload.message));
    }

    return next(action);
  };
