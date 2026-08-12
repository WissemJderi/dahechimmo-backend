import app from "./app";
import connectToDatabase from "./config/database";
import { MONGODB_URI, PORT } from "./config/env";

void connectToDatabase(MONGODB_URI);
app.listen(PORT);