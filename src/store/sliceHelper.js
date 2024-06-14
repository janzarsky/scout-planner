import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";

export function createSliceHook(slice, action) {
  return (table, rtkQuery) => {
    const dispatch = useDispatch();
    const {
      loading: status,
      [slice]: data,
      error,
      loaded,
    } = useSelector((state) => state[slice]);

    useEffect(() => {
      if (!rtkQuery && status === "idle" && !loaded && table !== undefined) {
        const client = firestoreClientFactory.getClient(table);
        dispatch(action(client));
      }
    }, [status, table, dispatch]);

    const isUninitialized = status === "idle" && !loaded;
    const isLoading = status === "pending" || status === undefined;
    const isError = status === "idle" && error !== null;
    const isSuccess = status === "idle" && loaded;

    return { data, isUninitialized, isLoading, isError, isSuccess };
  };
}
