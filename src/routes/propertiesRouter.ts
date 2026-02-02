import { Router } from "express";
import propertiesService from "../services/propertiesService";

const propertiesRouter = Router();

propertiesRouter.get("/", async (_req, res, next) => {
  try {
    const result = await propertiesService.getProperties();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default propertiesRouter;
