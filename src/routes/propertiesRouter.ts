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

propertiesRouter.post("/", async (req, res, next) => {
  try {
    const newProperty = await propertiesService.addProperty(req.body);
    res.status(201).json(newProperty);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.get("/:id", async (req, res, next): Promise<void> => {
  try {
    const property = await propertiesService.getProperty(req.params.id);
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProperty = await propertiesService.updateProperty(
      req.params.id,
      req.body,
    );
    if (!updatedProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
});

propertiesRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedProperty = await propertiesService.deleteProperty(
      req.params.id,
    );
    if (!deletedProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    res.json({ message: "Property deleted successfully", deletedProperty });
  } catch (error) {
    next(error);
  }
});

export default propertiesRouter;
