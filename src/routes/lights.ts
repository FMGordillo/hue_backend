import { Request, Response, Router } from "express";
import { ApiError, v3 } from "node-hue-api";
import invariant from "tiny-invariant";
const { discovery, api: hueApi, lightStates } = v3;

const router = Router();

const appName = "my_hue_lights";
const deviceName = "WTF";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function discoverBridge() {
  const discoveryResults = await discovery.nupnpSearch();

  if (discoveryResults.length === 0) {
    console.error("Failed to resolve any Hue Bridges");
    return null;
  } else {
    // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
    return discoveryResults[0].ipaddress;
  }
}

async function discoverAndCreateUser() {
  const ipAddress = await discoverBridge();
  invariant(ipAddress, "IP address is required");
  // Create an unauthenticated instance of the Hue API so that we can create a new user
  const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect();

  let createdUser;
  try {
    createdUser = await unauthenticatedApi.users.createUser(
      appName,
      deviceName
    );
    console.log(
      "*******************************************************************************\n"
    );
    console.log(
      "User has been created on the Hue Bridge. The following username can be used to\n" +
        "authenticate with the Bridge and provide full local access to the Hue Bridge.\n" +
        "YOU SHOULD TREAT THIS LIKE A PASSWORD\n"
    );
    console.log(`Hue Bridge User: ${createdUser.username}`);
    console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
    console.log(
      "*******************************************************************************\n"
    );

    // Create a new API instance that is authenticated with the new user we created
    const authenticatedApi = await hueApi
      .createLocal(ipAddress)
      .connect(createdUser.username);

    // Do something with the authenticated user/api
    const bridgeConfig =
      await authenticatedApi.configuration.getConfiguration();
    console.log(
      `Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`
    );
  } catch (err) {
    invariant(err instanceof ApiError, "Error creating Hue Bridge instance");
    if (err.getHueErrorType() === 101) {
      console.error(
        "The Link button on the bridge was not pressed. Please press the Link button and try again."
      );
    }
    console.error(`Unexpected Error: ${err.message}`);
  }
}

router.get("/discover", (req: Request, res: Response) => {
  // Invoke the discovery and create user code
  discoverAndCreateUser();
  res.send("Done?");
});

router.get("/on", async (req: Request, res: Response) => {
  invariant(process.env.PHILLIPS_HUE_USERNAME, "Username must be provided");
  invariant(process.env.PHILLIPS_HUE_IP_ADDRESS, "Ip address must be provided");
  const api = await v3.api
    .createLocal(process.env.PHILLIPS_HUE_IP_ADDRESS)
    .connect(process.env.PHILLIPS_HUE_USERNAME);
  const lights = await api.lights.getAll();
  const state = new lightStates.LightState();
  for await (const light of lights) {
    console.log({ state: light.state });
    // @ts-ignore
    if (light.state.on === true) {
      // @ts-ignore
      await api.lights.setLightState(light.data.id, state.off());
      await wait(1000);
    }
  }
  // res.send({ result });
  res.send("Holi");
  try {
  } catch (error) {
    throw new Error(error as string);
  }
});

export default router;
