import cheerio from "cheerio";
import { getBase64, sleep } from "../../helpers";
import "dotenv/config";
import { AxiosInstance } from "axios";

type CaptchaParams = {
  cookies: string;
  captchaKey: string;
};
export async function getParams(axios: AxiosInstance): Promise<CaptchaParams> {
  const response = await axios.get(
    "https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp"
  );

  const cookies = response.headers["set-cookie"]
    ? response.headers["set-cookie"].map((cookie) => cookie.split(";")[0]).join("; ")
    : "";

  const $ = cheerio.load(response.data);
  const hcaptchaKey = $("div.h-captcha")
    .get(0)
    ?.attributes.find((attr) => attr.name === "data-sitekey")?.value;

  if (!hcaptchaKey) {
    throw new Error("captcha key not founded");
  }
  return {
    cookies,
    captchaKey: hcaptchaKey,
  };
}

export async function getCnpjDocument(
  cnpj: string,
  axios: AxiosInstance,
  captchaResponse: string,
  params: CaptchaParams
) {
  const data = new URLSearchParams({
    origem: "comprovante",
    cnpj,
    "h-captcha-response": captchaResponse,
    search_type: "cnpj",
  }).toString();

  const validaCaptchaRes = await axios.post(
    "https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/valida_recaptcha.asp",
    data,
    {
      headers: {
        Cookie: `${params.cookies}`,
      },
    }
  );

  return validaCaptchaRes.data;
}

export async function solveCaptcha(axios: AxiosInstance, captchaParams: CaptchaParams) {
  const createCaptchaSolverTaskResponse = await createAnyCaptchaTask(axios, captchaParams);
  await sleep(2000);
  const firstResultCaptchaSolverTaskResponse = await getAnyCaptchaTaskResult(axios, createCaptchaSolverTaskResponse);

  const getCaptchaResponse = async (retries: number): Promise<any> => {
    await sleep(3000);
    const response = await getAnyCaptchaTaskResult(axios, createCaptchaSolverTaskResponse);
    if (response.status === "processing" && retries > 0) {
      return getCaptchaResponse(--retries);
    } else {
      return response.solution?.gRecaptchaResponse;
    }
  };

  const RETRIES = 15;
  const captchaResponse = await getCaptchaResponse(RETRIES);

  return {
    createCaptchaSolverTaskResponse,
    firstResultCaptchaSolverTaskResponse,
    captchaResponse,
    checkResult: () => getAnyCaptchaTaskResult(axios, createCaptchaSolverTaskResponse),
  };
}

type AnyCaptchaResponse = {
  errorId: number;
  taskId: number;
};
async function createAnyCaptchaTask(axios: AxiosInstance, captchaParams: CaptchaParams): Promise<AnyCaptchaResponse> {
  console.log("creating task with ", captchaParams);
  try {
    const response = await axios.post("https://api.anycaptcha.com/createTask", {
      clientKey: process.env.ANYCAPTCHA_KEY,
      task: {
        type: "HCaptchaTaskProxyless",
        websiteURL: "https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
        websiteKey: captchaParams.captchaKey,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("fail to create task");
  }
}

type AnycaptchaTaskResult = {
  errorId: number;
  errorCode?: string;
  errorDescription?: string;
  status?: "ready" | "processing";
  solution?: {
    gRecaptchaResponse: string;
  };
};
async function getAnyCaptchaTaskResult(
  axios: AxiosInstance,
  createTaskResponse: AnyCaptchaResponse
): Promise<AnycaptchaTaskResult> {
  try {
    const response = await axios.post("https://api.anycaptcha.com/getTaskResult", {
      clientKey: process.env.ANYCAPTCHA_KEY,
      taskId: createTaskResponse.taskId,
    });
    return response.data;
  } catch (error) {
    throw new Error("fail to create task");
  }
}
