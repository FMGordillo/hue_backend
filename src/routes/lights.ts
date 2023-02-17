import type { Request, Response } from "express";
import { Router } from "express";
import invariant from "tiny-invariant";
import { getHueClient, getHueLib } from "../lib/hue";

const router = Router();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", async (req: Request, res: Response) => {
  const hueApi = await getHueClient();
  const lights = await hueApi.lights.getAll();
  const mappedLights = lights.map((light) => ({
    id: light.getAttributeValue("id"),
    state: light.getAttributeValue("state"),
  }));
  res.send(mappedLights);
});

router.get("/:lightId", async (req: Request, res: Response) => {
  try {
    const { lightId } = req.params;
    invariant(!!lightId, "Light must be specified");
    const hueApi = await getHueClient();
    const light = await hueApi.lights.getLight(lightId);
    res.send({
      id: light.getAttributeValue("id"),
      state: light.getAttributeValue("state"),
    });
  } catch (error) {
    console.log({ error });
    res.sendStatus(400);
  }
});

router.put("/:lightId", async (req: Request, res: Response) => {
  try {
    const { id, hue, sat, bri, on } = req.body;
    console.log({ body: req.body });
    invariant(!!id, "Light id must be specified");
    // invariant(!!hue, "Light hue must be specified");
    // invariant(!!sat, "Light sat must be specified");
    // invariant(!!bri, "Light bri must be specified");
    invariant(on !== undefined, "Light on must be specified");
    const hueApi = await getHueClient();
    const hueLib = getHueLib();
    const light = await hueApi.lights.getLight(id);
    const currentLightState = light.getAttributeValue("state");
    const lightState = new hueLib.lightStates.LightState()
      .on(on)
      .sat(sat || currentLightState.sat)
      .hue(hue || currentLightState.hue)
      .bri(bri || currentLightState.bri);
    await hueApi.lights.setLightState(id, lightState);

    const newLight = await hueApi.lights.getLight(id);
    res.send({
      id: newLight.getAttributeValue("id"),
      state: newLight.getAttributeValue("state"),
    });
  } catch (error) {
    // @ts-ignore
    console.log({ error, hueError: error._hueError });
    res.sendStatus(400);
  }
});

router.get("/toggle/:mode", async (req: Request, res: Response) => {
  const { mode } = req.params;
  const hueApi = await getHueClient();
  invariant(mode === "on" || mode === "off", "Invalid mode");
  const lights = await hueApi.lights.getAll();
  for await (const light of lights) {
    const id = light.getAttributeValue("id");
    await hueApi.lights.setLightState(id, { on: mode === "on" });
    await wait(200);
  }
  res.sendStatus(200);
  try {
  } catch (error) {
    throw new Error(error as string);
  }
});

export default router;
