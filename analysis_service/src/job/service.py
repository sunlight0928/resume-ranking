import json
import time

import jsbeautifier
from langchain.schema import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from src.job.config import job_config
from src.job.prompts import fn_job_analysis, system_prompt_job
from src.utils import LOGGER


def output2json(output):
    """GPT Output Object >>> json"""
    opts = jsbeautifier.default_options()
    return json.loads(jsbeautifier.beautify(output["function_call"]["arguments"], opts))


def analyse_job(job_data):
    start = time.time()
    LOGGER.info("Start analyse job")

    # Initialize the ChatGoogleGenerativeAI LLM with the desired configuration
    llm = ChatGoogleGenerativeAI(model=job_config.MODEL_NAME, temperature=0.5)
    completion = llm.predict_messages(
        [
            SystemMessage(content=system_prompt_job),
            HumanMessage(content=job_data.job_description),
        ],
        functions=fn_job_analysis,
    )
    output_analysis = completion.additional_kwargs

    # Convert the output to JSON
    json_output = output2json(output=output_analysis)

    LOGGER.info("Done analyse job")
    LOGGER.info(f"Time analyse job: {time.time() - start}")

    return json_output