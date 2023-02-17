import { v3 } from "node-hue-api";
import invariant from "tiny-invariant";

export const getHueClient = async () => {
  invariant(process.env.PHILLIPS_HUE_USERNAME, "Username must be provided");
  invariant(process.env.PHILLIPS_HUE_IP_ADDRESS, "Ip address must be provided");

  return v3.api
    .createLocal(process.env.PHILLIPS_HUE_IP_ADDRESS)
    .connect(process.env.PHILLIPS_HUE_USERNAME);
};

export const getHueLib = () => v3;
