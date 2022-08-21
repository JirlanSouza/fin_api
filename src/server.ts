import { app } from "./app";
import { DbConnection } from "./database";

DbConnection.create();
app.listen(3333, () => {
  console.log("Server is running");
});
