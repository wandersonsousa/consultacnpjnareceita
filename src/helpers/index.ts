import axios from "axios";
import fs from "fs";

export function getBase64(url: string, headers: any) {
  return axios
    .get(url, {
      responseType: "arraybuffer",
      headers: {
        ...headers,
      },
    })
    .then((response) => {
      fs.writeFileSync("image.png", response.data);
      return Buffer.from(response.data).toString("base64");
    });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
