import { getCnpjDocument, getParams, solveCaptcha } from "./cnpj-consult-with-anycaptcha";

import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { sleep } from "../../helpers";
import fs from "fs";

export default async function (cnpj: string) {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      jar,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        pragma: "no-cache",
        "upgrade-insecure-requests": "1",
        referrer: "http://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=",
      },
    })
  );

  const params = await getParams(client);

  const captchaSolved = await solveCaptcha(axios.create(), params);
  if (captchaSolved.captchaResponse) {
    console.log("searching document for", cnpj);
    const cnpj_doc = await getCnpjDocument(cnpj, client, captchaSolved.captchaResponse, params);
    fs.writeFileSync("cnpjdoc.html", cnpj_doc);
    return cnpj_doc;
  } else {
    console.error("fail solving captcha");
    return null;
  }
}
